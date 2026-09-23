import { ROUTES } from "@/lib/consts";
import { expect, test } from "@/tests/e2e/fixtures";
import { signUpAndLoginTestUser } from "@/tests/e2e/helpers/auth";
import { setE2eUserCredits } from "@/tests/e2e/helpers/billing";

test.describe("Out-of-credits paywall", () => {
	test("Generating a program with 0 credits shows the paywall instead of succeeding", async ({
		page,
		request,
	}, testInfo) => {
		let user: Awaited<ReturnType<typeof signUpAndLoginTestUser>>;

		await test.step("Authenticate and zero out credits", async () => {
			user = await signUpAndLoginTestUser(page, request, `paywall-${testInfo.testId}`);
			setE2eUserCredits(user.email, 0);
		});

		await test.step("Attempt to generate a program", async () => {
			await page.goto(ROUTES.PROGRAMS);
			await page.getByRole("button", { name: "Create program", exact: true }).click();
			await expect(page.getByRole("heading", { name: "Create Program" })).toBeVisible();

			await page
				.getByLabel("Workout description")
				.fill("A 4-day upper/lower split focused on building strength with compound lifts.");
			await page.getByRole("button", { name: "Generate Program" }).click();
		});

		await test.step("Paywall opens instead of a success toast", async () => {
			// Verifies the credit-gating + paywall wiring only. Clicking through to a real Stripe
			// Checkout session requires STRIPE_SECRET_KEY / STRIPE_CREDIT_PACK_PRICE_ID, which are
			// per-environment manual Stripe Dashboard setup (see the billing plan) — not something
			// this suite can provision, so that redirect is verified manually per environment instead.
			const dialog = page.getByRole("dialog", { name: /out of credits/i });
			await expect(dialog).toBeVisible();

			const buyButton = dialog.getByRole("button", { name: /Buy/i });
			await expect(buyButton).toBeEnabled();
		});
	});
});
