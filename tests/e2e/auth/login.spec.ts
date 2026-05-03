import { ROUTES } from "@/lib/consts";
import { expect, test } from "@/tests/e2e/fixtures";
import { signUpAndLoginTestUser } from "@/tests/e2e/helpers/auth";
import { registerTestUserEmail } from "@/tests/e2e/helpers/test-user-cleanup";

test.describe("Auth", () => {
	test("UI sign up creates account and redirects to dashboard", async ({ page }) => {
		const credential = `auth-signup-ui-${Date.now()}@example.com`;

		await test.step("Fill and submit registration form", async () => {
			await page.goto(ROUTES.REGISTER);
			await page.getByLabel("First name").fill("Playwright");
			await page.getByLabel("Last name").fill("User");
			await page.getByLabel("Email").fill(credential);
			await page.getByLabel("Password", { exact: true }).fill(credential);
			await page.getByLabel("Confirm Password").fill(credential);
			await page.getByRole("button", { name: "Create an account" }).click();
		});

		await test.step("Verify successful account creation and redirect", async () => {
			await expect(page.getByText("Account created successfully!")).toBeVisible();
			registerTestUserEmail(credential);
			await expect(page).toHaveURL(/\/$|\/workout\/.*/);
			await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
		});
	});

	test("Email/Password login redirects to dashboard", async ({ page, request }) => {
		await test.step("Sign up and login with email/password", async () => {
			await signUpAndLoginTestUser(page, request, "auth-login");
		});
		await test.step("Verify dashboard is shown", async () => {
			await expect(page).toHaveURL(/^(?!.*\/login$).*/);
			await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
		});
	});
});
