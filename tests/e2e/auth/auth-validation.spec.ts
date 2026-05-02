import { expect, test } from "@playwright/test";

import { ROUTES } from "@/lib/consts";
import { buildTestUser, signUpTestUser } from "@/tests/e2e/helpers/auth";

test.describe("Auth validation", () => {
	test("Login with wrong password shows error and stays on login", async ({ page, request }) => {
		const user = buildTestUser("auth-wrong-pass");
		await signUpTestUser(request, user);

		await page.goto(ROUTES.LOGIN);
		await page.getByLabel("Email").fill(user.email);
		await page.getByLabel("Password").fill("DefinitelyWrongPassword123!");
		await page.getByRole("button", { name: "Login" }).click();

		await expect(page).toHaveURL(new RegExp(`${ROUTES.LOGIN.replace("/", "\\/")}$`));
		await expect(page.locator("[data-sonner-toast]").first()).toBeVisible({ timeout: 8000 });
	});

	test("Register with mismatched passwords shows validation message", async ({ page }) => {
		await page.goto(ROUTES.REGISTER);
		await page.getByLabel("First name").fill("Test");
		await page.getByLabel("Last name").fill("User");
		await page.getByLabel("Email").fill(`mismatch-${Date.now()}@example.com`);
		await page.getByLabel("Password", { exact: true }).fill("same-password-123");
		await page.getByLabel("Confirm Password").fill("different-password-456");
		await page.getByRole("button", { name: "Create an account" }).click();

		await expect(page.getByText("Passwords do not match")).toBeVisible();
		await expect(page).toHaveURL(new RegExp(`${ROUTES.REGISTER.replace("/", "\\/")}$`));
	});
});
