import { ROUTES } from "@/lib/consts";
import { expect, test } from "@/tests/e2e/fixtures";
import { signUpAndLoginTestUser } from "@/tests/e2e/helpers/auth";
import { createProgram } from "@/tests/e2e/helpers/entities";

test.describe("Program CRUD", () => {
	test("Authenticated user can perform CRUD on a workout program", async ({ page, request }) => {
		await test.step("Authenticate user", async () => {
			await signUpAndLoginTestUser(page, request, "program-crud");
		});
		const programName = `E2E Program ${Date.now()}`;
		const updatedProgramName = `${programName} Updated`;

		await test.step("Create and open program", async () => {
			await createProgram(page, programName);
			await expect(page.getByRole("button", { name: `Open program ${programName}` })).toBeVisible();
			await page.getByRole("button", { name: `Open program ${programName}` }).click();
			await expect(page).toHaveURL(/\/programs\/[^/?#]+$/);
			await expect(page.getByRole("heading", { name: programName })).toBeVisible();
		});

		await test.step("Update program", async () => {
			await page.getByRole("button", { name: "Program actions" }).click();
			await page.getByRole("menuitem", { name: "Edit Program" }).click();
			await expect(page.getByRole("heading", { name: "Edit Program" })).toBeVisible();
			await page.getByLabel("Program Name").fill(updatedProgramName);
			await page.getByRole("button", { name: "Save Changes" }).click();
			await expect(page.getByText("Program updated successfully.")).toBeVisible();
			await expect(page.getByRole("heading", { name: updatedProgramName })).toBeVisible();
		});

		await test.step("Delete program and verify removal", async () => {
			await page.getByRole("button", { name: "Program actions" }).click();
			await page.getByRole("menuitem", { name: "Delete Program" }).click();
			await page.getByRole("button", { name: "Confirm" }).click();
			await expect(page.getByText("Program deleted successfully.")).toBeVisible();
			await expect(page).toHaveURL(ROUTES.PROGRAMS);
			await expect(
				page.getByRole("button", { name: `Open program ${updatedProgramName}` }),
			).toHaveCount(0);
		});
	});
});
