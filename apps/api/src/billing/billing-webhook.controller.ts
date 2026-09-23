import { Controller, HttpCode, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import type Stripe from "stripe";

import { ApiError } from "@/api-error";
import { handleStripeWebhookEvent } from "@/billing/billing.service";
import { getStripeClient } from "@/billing/stripe-client";

/** Kept in sync with main.ts, which routes this exact path through express.raw() instead of express.json(). */
export const STRIPE_WEBHOOK_PATH = "/api/billing/webhook";

/** Separate, unguarded controller: Stripe calls this directly, with no Better Auth session. */
@Controller("billing")
export class BillingWebhookController {
	@Post("webhook")
	@HttpCode(200)
	async webhook(@Req() req: Request) {
		const signature = req.headers["stripe-signature"];
		if (typeof signature !== "string") {
			throw new ApiError("Missing signature", 400);
		}

		let event: Stripe.Event;
		try {
			event = getStripeClient().webhooks.constructEvent(
				req.body as Buffer,
				signature,
				process.env.STRIPE_WEBHOOK_SECRET ?? "",
			);
		} catch {
			throw new ApiError("Invalid webhook signature", 400);
		}

		await handleStripeWebhookEvent(event);
		return { received: true };
	}
}
