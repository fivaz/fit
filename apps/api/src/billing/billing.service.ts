import type Stripe from "stripe";

import { ApiError } from "@/api-error";
import { getStripeClient } from "@/billing/stripe-client";
import { logError } from "@/logger";
import { prisma } from "@/prisma/client";

/**
 * Brand values from apps/web/app/globals.css: --primary (orange) and the dark --background. With
 * Managed Payments on, Stripe only applies the header colour and business name; the body and the
 * Pay button stay Stripe's, so button_color/font/border only matter if that is ever turned off.
 */
const CHECKOUT_BRANDING = {
	background_color: "#09090b",
	button_color: "#ff6900",
	border_style: "rounded",
	font_family: "inter",
	display_name: "Fit-Tracker",
} satisfies Stripe.Checkout.SessionCreateParams.BrandingSettings;

const DEFAULT_LOCAL_WEB_APP_URL = "http://localhost:3000";

function resolveWebAppUrl(): string {
	return process.env.WEB_APP_URL?.trim() || DEFAULT_LOCAL_WEB_APP_URL;
}

export const CREDIT_PACK = {
	credits: 100,
	priceId: process.env.STRIPE_CREDIT_PACK_PRICE_ID ?? "",
	displayName: "100 Credits",
	displayPrice: "CHF 2.00",
} as const;

export async function getCreditBalance(userId: string) {
	const user = await prisma.user.findUniqueOrThrow({
		where: { id: userId },
		select: { credits: true },
	});

	return {
		credits: user.credits,
		pack: {
			credits: CREDIT_PACK.credits,
			displayName: CREDIT_PACK.displayName,
			displayPrice: CREDIT_PACK.displayPrice,
		},
	};
}

/** Atomically charges one generation credit. Throws 402 if the user has none left. */
export async function consumeGenerationCredit(userId: string): Promise<void> {
	const result = await prisma.user.updateMany({
		where: { id: userId, credits: { gt: 0 } },
		data: { credits: { decrement: 1 } },
	});

	if (result.count === 0) {
		throw new ApiError("You're out of credits. Buy more to keep generating programs.", 402);
	}
}

/** Refunds a credit charged by consumeGenerationCredit when generation fails afterward. */
export async function refundGenerationCredit(userId: string): Promise<void> {
	await prisma.user.update({
		where: { id: userId },
		data: { credits: { increment: 1 } },
	});
}

export async function createCheckoutSession(userId: string): Promise<{ url: string }> {
	const webAppUrl = resolveWebAppUrl();

	let session: Stripe.Checkout.Session;
	try {
		session = await getStripeClient().checkout.sessions.create({
			ui_mode: "hosted_page",
			mode: "payment",
			billing_address_collection: "auto",
			phone_number_collection: { enabled: false },
			// Checkout Studio asked for automatic_tax.enabled=false, but Stripe rejects that while Managed
			// Payments is on (it handles tax itself); the parameter must be omitted or true.
			allow_promotion_codes: false,
			submit_type: "auto",
			integration_identifier: "hosted_web_0001",
			origin_context: "web",
			branding_settings: CHECKOUT_BRANDING,
			line_items: [{ price: CREDIT_PACK.priceId, quantity: 1 }],
			// Not Checkout Studio parameters, but required: the webhook credits the account from metadata.userId.
			client_reference_id: userId,
			metadata: { userId },
			success_url: `${webAppUrl}/settings?checkout=success`,
			cancel_url: `${webAppUrl}/settings?checkout=cancel`,
		});
	} catch (error) {
		logError(error, "createCheckoutSession", { extra: { userId } });
		throw new ApiError("Could not start checkout. Please try again later.", 502);
	}

	if (!session.url) {
		throw new ApiError("Failed to start checkout", 500);
	}

	return { url: session.url };
}

function isUniqueConstraintError(error: unknown): boolean {
	return (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		(error as { code?: unknown }).code === "P2002"
	);
}

/** Idempotent: Stripe may redeliver the same event, which becomes a no-op via the unique constraint on stripeSessionId. */
export async function handleStripeWebhookEvent(event: Stripe.Event): Promise<void> {
	if (event.type !== "checkout.session.completed") return;

	const session = event.data.object as Stripe.Checkout.Session;
	const userId = session.metadata?.userId;
	if (!userId) {
		logError(
			new Error("checkout.session.completed missing userId metadata"),
			"handleStripeWebhookEvent",
			{
				extra: { sessionId: session.id },
			},
		);
		return;
	}

	try {
		await prisma.$transaction([
			prisma.creditPurchase.create({
				data: {
					userId,
					stripeSessionId: session.id,
					stripePaymentIntentId:
						typeof session.payment_intent === "string" ? session.payment_intent : null,
					creditsGranted: CREDIT_PACK.credits,
					amountTotal: session.amount_total ?? 0,
					currency: session.currency ?? "usd",
				},
			}),
			prisma.user.update({
				where: { id: userId },
				data: { credits: { increment: CREDIT_PACK.credits } },
			}),
		]);
	} catch (error) {
		if (isUniqueConstraintError(error)) return;
		throw error;
	}
}
