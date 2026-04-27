import { expect, test } from "@playwright/test";

import {
	createProgram,
	ensureSharedTestUser,
	getSharedTestUser,
	loginWithEmailPassword,
} from "@/tests/e2e/helpers/flow-helpers";

test.describe.serial("Auth and programs", () => {
	const testUser = getSharedTestUser();

	test.beforeAll(async ({ request }) => {
		await ensureSharedTestUser(request, testUser);
	});

	test("Email/Password login redirects to dashboard", async ({ page }) => {
		await loginWithEmailPassword(page, testUser);
		await expect(page).toHaveURL(/^(?!.*\/login$).*/);
		await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
	});

	test("Authenticated user can create a workout program", async ({ page }) => {
		await loginWithEmailPassword(page, testUser);
		const programName = `E2E Program ${Date.now()}`;
		await createProgram(page, programName);
		await expect(page.getByText(programName).first()).toBeVisible();
	});
});
