import { expect, test } from "@/tests/e2e/fixtures";
import { signUpAndLoginTestUser } from "@/tests/e2e/helpers/auth";
import { createProgram } from "@/tests/e2e/helpers/entities";
import { openProgramFromList } from "@/tests/e2e/helpers/program-workout";

test.describe("Program exercise progress", () => {
	test("Program page links to its exercise progress page", async ({ page, request }, testInfo) => {
		const programName = `Progress Program - ${testInfo.testId}`;

		await test.step("Authenticate and create a program", async () => {
			await signUpAndLoginTestUser(page, request, "program-exercise-progress");
			await createProgram(page, programName);
		});

		await test.step("Open the exercise progress page from the program page", async () => {
			await openProgramFromList(page, programName);
			await page.getByRole("link", { name: "Exercise progress" }).click();

			await expect(page).toHaveURL(/\/programs\/progress\?id=/);
			await expect(page.getByRole("heading", { name: "Exercise progress" })).toBeVisible();
			await expect(page.getByText(programName)).toBeVisible();
			await expect(page.getByText("This program has no exercises yet.")).toBeVisible();
		});

		await test.step("Go back to the program", async () => {
			await page.getByRole("link", { name: "Back to program" }).click();
			await expect(page.getByRole("heading", { name: programName })).toBeVisible();
		});
	});
});
