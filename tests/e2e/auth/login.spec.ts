import { expect, test } from "@playwright/test";

import { ROUTES } from "@/lib/consts";
import { signUpAndLoginTestUser } from "@/tests/e2e/helpers/auth";

test.describe("Auth", () => {
	test("UI sign up creates account and redirects to dashboard", async ({ page }) => {
		const credential = `auth-signup-ui-${Date.now()}@example.com`;

		await page.goto(ROUTES.REGISTER);
		await page.getByLabel("First name").fill("Playwright");
		await page.getByLabel("Last name").fill("User");
		await page.getByLabel("Email").fill(credential);
		await page.getByLabel("Password", { exact: true }).fill(credential);
		await page.getByLabel("Confirm Password").fill(credential);
		await page.getByRole("button", { name: "Create an account" }).click();

		await expect(page.getByText("Account created successfully!")).toBeVisible();
		await expect(page).toHaveURL(/\/$|\/workout\/.*/);
		await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
	});

	test("Email/Password login redirects to dashboard", async ({ page, request }) => {
		await signUpAndLoginTestUser(page, request, "auth-login");
		await expect(page).toHaveURL(/^(?!.*\/login$).*/);
		await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
	});
});
