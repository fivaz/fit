import { expect, test } from "@playwright/test";

import { createProgram, signUpAndLoginTestUser } from "@/tests/e2e/helpers/flow-helpers";

test.describe("Auth and programs", () => {
	test("Email/Password login redirects to dashboard", async ({ page, request }) => {
		await signUpAndLoginTestUser(page, request, "auth-programs-login");
		await expect(page).toHaveURL(/^(?!.*\/login$).*/);
		await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
	});

	test("Authenticated user can create a workout program", async ({ page, request }) => {
		await signUpAndLoginTestUser(page, request, "auth-programs-create");
		const programName = `E2E Program ${Date.now()}`;
		await createProgram(page, programName);
		await expect(page.getByText(programName).first()).toBeVisible();
	});
});
