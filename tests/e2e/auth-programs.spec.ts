import { expect, test } from "@playwright/test";

import { ROUTES } from "@/lib/consts";
import { createProgram, signUpAndLoginTestUser } from "@/tests/e2e/helpers/flow-helpers";

test.describe("Auth and programs", () => {
	test("Email/Password login redirects to dashboard", async ({ page, request }) => {
		await signUpAndLoginTestUser(page, request, "auth-programs-login");
		await expect(page).toHaveURL(/^(?!.*\/login$).*/);
		await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
	});

	test("Authenticated user can perform CRUD on a workout program", async ({ page, request }) => {
		await signUpAndLoginTestUser(page, request, "auth-programs-create");
		const programName = `E2E Program ${Date.now()}`;
		const updatedProgramName = `${programName} Updated`;

		// Create + Read
		await createProgram(page, programName);
		await expect(page.getByRole("link", { name: `Open program ${programName}` })).toBeVisible();
		await page.getByRole("link", { name: `Open program ${programName}` }).click();
		await expect(page.getByRole("heading", { name: programName })).toBeVisible();

		// Update
		await page.getByRole("button", { name: "Program actions" }).click();
		await page.getByRole("menuitem", { name: "Edit Program" }).click();
		await expect(page.getByRole("heading", { name: "Edit Program" })).toBeVisible();
		await page.getByLabel("Program Name").fill(updatedProgramName);
		await page.getByRole("button", { name: "Save Changes" }).click();
		await expect(page.getByText("Program updated successfully.")).toBeVisible();
		await expect(page.getByRole("heading", { name: updatedProgramName })).toBeVisible();

		// Delete
		await page.getByRole("button", { name: "Program actions" }).click();
		await page.getByRole("menuitem", { name: "Delete Program" }).click();
		await page.getByRole("button", { name: "Confirm" }).click();
		await expect(page.getByText("Program deleted successfully.")).toBeVisible();
		await expect(page).toHaveURL(ROUTES.PROGRAMS);
		await expect(
			page.getByRole("link", { name: `Open program ${updatedProgramName}` }),
		).toHaveCount(0);
	});
});
