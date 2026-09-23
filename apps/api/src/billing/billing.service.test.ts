// Integration tests against the real database (DATABASE_URL from .env), not mocks. Node's
// built-in `t.mock.method` can't patch Prisma 7's client: its model delegates (prisma.user,
// prisma.creditPurchase, ...) are Proxy-based, so `Object.getOwnPropertyDescriptor` reports
// `value: undefined` for every method — confirmed directly, not just via a failing test — which
// is structurally incompatible with how node:test's mock tracker saves/restores originals.
// A real DB also proves what actually matters here: that the atomic decrement guard and the
// webhook's idempotency both hold at the SQL level, which a mock could not verify either way.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, describe, it } from "node:test";

import type Stripe from "stripe";

import { ApiError } from "@/api-error";
import {
	consumeGenerationCredit,
	CREDIT_PACK,
	handleStripeWebhookEvent,
	refundGenerationCredit,
} from "@/billing/billing.service";
import { prisma } from "@/prisma/client";

const createdUserIds: string[] = [];

async function createTestUser(credits: number) {
	const id = `test-billing-${randomUUID()}`;
	createdUserIds.push(id);
	await prisma.user.create({
		data: { id, name: "Billing Test User", email: `${id}@example.test`, credits },
	});
	return id;
}

function makeCheckoutCompletedEvent(
	userId: string,
	sessionOverrides: Record<string, unknown> = {},
) {
	return {
		type: "checkout.session.completed",
		data: {
			object: {
				id: `cs_test_${randomUUID()}`,
				metadata: { userId },
				payment_intent: "pi_123",
				amount_total: 500,
				currency: "usd",
				...sessionOverrides,
			},
		},
	} as unknown as Stripe.Event;
}

after(async () => {
	if (createdUserIds.length > 0) {
		await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
	}
	await prisma.$disconnect();
});

describe("consumeGenerationCredit", () => {
	it("decrements credits when the user has some", async () => {
		const userId = await createTestUser(3);

		await consumeGenerationCredit(userId);

		const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
		assert.equal(user.credits, 2);
	});

	it("throws a 402 ApiError and leaves credits unchanged when the user has none", async () => {
		const userId = await createTestUser(0);

		await assert.rejects(
			() => consumeGenerationCredit(userId),
			(error: unknown) => error instanceof ApiError && error.status === 402,
		);

		const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
		assert.equal(user.credits, 0);
	});
});

describe("refundGenerationCredit", () => {
	it("increments credits by 1", async () => {
		const userId = await createTestUser(1);

		await refundGenerationCredit(userId);

		const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
		assert.equal(user.credits, 2);
	});
});

describe("handleStripeWebhookEvent", () => {
	it("ignores event types other than checkout.session.completed", async () => {
		const userId = await createTestUser(0);

		await handleStripeWebhookEvent({ type: "payment_intent.succeeded" } as unknown as Stripe.Event);

		const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
		assert.equal(user.credits, 0);
	});

	it("returns without crediting when the session has no userId metadata", async () => {
		await handleStripeWebhookEvent(makeCheckoutCompletedEvent("", { metadata: {} }));
		// No assertion target beyond "doesn't throw" — there's no user to check credits on.
	});

	it("credits the account and records the purchase on first delivery", async () => {
		const userId = await createTestUser(0);
		const event = makeCheckoutCompletedEvent(userId);

		await handleStripeWebhookEvent(event);

		const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
		assert.equal(user.credits, CREDIT_PACK.credits);

		const purchase = await prisma.creditPurchase.findUnique({
			where: { stripeSessionId: (event.data.object as Stripe.Checkout.Session).id },
		});
		assert.ok(purchase);
		assert.equal(purchase.creditsGranted, CREDIT_PACK.credits);
	});

	it("is a no-op when the same event is redelivered (unique constraint on stripeSessionId)", async () => {
		const userId = await createTestUser(0);
		const event = makeCheckoutCompletedEvent(userId);

		await handleStripeWebhookEvent(event);
		await handleStripeWebhookEvent(event); // redelivery

		const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
		assert.equal(user.credits, CREDIT_PACK.credits); // credited once, not twice
	});
});
