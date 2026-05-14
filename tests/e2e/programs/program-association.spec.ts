import { expect, test } from "@/tests/e2e/fixtures";
import { signUpAndLoginTestUser } from "@/tests/e2e/helpers/auth";
import { createExercise, createProgram } from "@/tests/e2e/helpers/entities";

test.describe("Program Associations", () => {
	test("Authenticated user can associate exercises with a program", async ({ page, request }) => {
		await test.step("Authenticate user", async () => {
			await signUpAndLoginTestUser(page, request, "program-assoc");
		});

		const exerciseOne = `Assoc Exercise A ${Date.now()}`;
		const exerciseTwo = `Assoc Exercise B ${Date.now()}`;
		const programName = `Assoc Program ${Date.now()}`;

		await test.step("Create exercises and program", async () => {
			await createExercise(page, exerciseOne);
			await createExercise(page, exerciseTwo);
			await createProgram(page, programName);
		});

		await test.step("Open program details", async () => {
			await page.getByRole("button", { name: `Open program ${programName}` }).click();
			await expect(page.getByRole("heading", { name: programName })).toBeVisible();
		});

		await test.step("Associate exercises in add dialog", async () => {
			await page.getByRole("button", { name: "Program actions" }).click();
			await page.getByRole("menuitem", { name: "Add Exercises" }).click();
			await expect(page.getByRole("heading", { name: "Add Exercises" })).toBeVisible();
			const addExercisesDialog = page.getByRole("dialog");

			await addExercisesDialog.getByRole("button", { name: "All" }).click();
			await addExercisesDialog
				.getByRole("textbox", { name: "Search exercises..." })
				.fill(exerciseOne);
			await addExercisesDialog.getByText(exerciseOne).first().click();
			await addExercisesDialog
				.getByRole("textbox", { name: "Search exercises..." })
				.fill(exerciseTwo);
			await addExercisesDialog.getByText(exerciseTwo).first().click();
			await addExercisesDialog.getByRole("button", { name: "Confirm (2) exercises" }).click();
		});

		await test.step("Verify associated exercises are shown", async () => {
			await expect(page.getByText("Exercises updated successfully.")).toBeVisible();
			await expect(
				page.getByRole("button", { name: `Open exercise ${exerciseOne}` }),
			).toBeVisible();
			await expect(
				page.getByRole("button", { name: `Open exercise ${exerciseTwo}` }),
			).toBeVisible();
		});
	});
});
