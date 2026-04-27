import { expect, test } from "@playwright/test";

import { signUpAndLoginTestUser } from "@/tests/e2e/helpers/auth";

test.describe("Auth", () => {
	test("Email/Password login redirects to dashboard", async ({ page, request }) => {
		await signUpAndLoginTestUser(page, request, "auth-login");
		await expect(page).toHaveURL(/^(?!.*\/login$).*/);
		await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
	});
});
