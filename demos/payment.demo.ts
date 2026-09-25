import { ROUTES } from "@/lib/consts";

import { expect, test } from "./support/fixtures";
import { beat, HOLD, settle, typeSlowly } from "./support/pacing";
import { startStripeWebhookForwarding } from "./support/stripe-webhooks";

// Stripe's always-successful test card, with any future expiry and any CVC.
const TEST_CARD = { number: "4242424242424242", expiry: "1234", cvc: "123" };

// Out of credits -> paywall -> Stripe Checkout (test mode) -> back in the app with credits added.
// Starts with 0 credits (see the reseed fixture). The waits on Stripe's page load and payment
// processing are cut out during conversion.
test("payment", async ({ page, timeline }) => {
	test.skip(
		!process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_"),
		"Needs a test-mode STRIPE_SECRET_KEY; never record a real payment.",
	);
	test.skip(!process.env.STRIPE_CREDIT_PACK_PRICE_ID, "STRIPE_CREDIT_PACK_PRICE_ID is not set.");

	const stopWebhookForwarding = await startStripeWebhookForwarding();

	try {
		await test.step("Try to generate a program with no credits left", async () => {
			await page.goto(ROUTES.PROGRAMS);
			await expect(page.getByRole("heading", { name: "Programs" })).toBeVisible();
			await settle(page);
			// The video was already rolling while the Stripe CLI booted; drop those blank seconds.
			timeline.cut(0, timeline.now());
			await beat(page, HOLD.glance);
			await page.getByRole("button", { name: "Create program", exact: true }).click();
			await expect(page.getByRole("heading", { name: "Create Program" })).toBeVisible();
			await beat(page, HOLD.glance);
			await typeSlowly(page.getByLabel("Workout description"), "3-day full body plan", 50);
			await beat(page, HOLD.glance);
			await page.getByRole("button", { name: "Generate Program" }).click();
		});

		await test.step("Hit the paywall and buy credits", async () => {
			const paywall = page.getByRole("dialog", { name: /out of credits/i });
			await expect(paywall).toBeVisible();
			await beat(page, HOLD.linger);
			await paywall.getByRole("button", { name: /^Buy / }).click();
		});

		await test.step("Pay on Stripe Checkout with a test card", async () => {
			const cutFrom = timeline.now() + 1;
			const email = page.getByLabel("Email");
			await expect(email).toBeVisible({ timeout: 30_000 });
			// Not `settle`: Stripe's page keeps analytics requests going, so it never goes network-idle.
			await page.evaluate(() => document.fonts.ready);
			timeline.cut(cutFrom, timeline.now() - 0.3);
			await beat(page, HOLD.read);

			await typeSlowly(email, "alex.morgan@example.com", 25);
			await typeSlowly(page.getByPlaceholder("1234 1234 1234 1234"), TEST_CARD.number, 35);
			await typeSlowly(page.getByPlaceholder("MM / YY"), TEST_CARD.expiry, 60);
			await typeSlowly(page.getByPlaceholder("CVC"), TEST_CARD.cvc, 60);
			await typeSlowly(page.getByLabel("Cardholder name"), "Alex Morgan", 40);
			await beat(page, HOLD.glance);
			await page.getByTestId("hosted-payment-submit-button").click();
		});

		await test.step("Return to Settings with the credits added", async () => {
			const cutFrom = timeline.now() + 1.5;
			// Matches the Settings URL Stripe redirects to, with or without the ?checkout=success query.
			await expect(page).toHaveURL(new RegExp(`${ROUTES.SETTINGS}(\\?checkout=success)?$`), {
				timeout: 60_000,
			});
			timeline.cut(cutFrom, timeline.now() - 0.3);
			// Matches the return toast, "Payment received. Updating your credits...".
			await expect(page.getByText(/^Payment received/)).toBeVisible();
			// The webhook credits the account; the page refetches the balance shortly after returning.
			await expect(page.getByText("100", { exact: true })).toBeVisible({ timeout: 15_000 });
			await beat(page, HOLD.linger);
		});
	} finally {
		stopWebhookForwarding();
	}
});
