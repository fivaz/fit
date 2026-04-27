import { expect, test } from "@playwright/test";

import { signUpAndLoginTestUser } from "@/tests/e2e/helpers/auth";
import { createExercise, createProgram } from "@/tests/e2e/helpers/entities";

test.describe("Program Associations", () => {
	test("Authenticated user can associate exercises with a program", async ({ page, request }) => {
		await signUpAndLoginTestUser(page, request, "program-assoc");

		const exerciseOne = `Assoc Exercise A ${Date.now()}`;
		const exerciseTwo = `Assoc Exercise B ${Date.now()}`;
		const programName = `Assoc Program ${Date.now()}`;

		await createExercise(page, exerciseOne);
		await createExercise(page, exerciseTwo);
		await createProgram(page, programName);

		await page.getByRole("link", { name: `Open program ${programName}` }).click();
		await expect(page.getByRole("heading", { name: programName })).toBeVisible();

		await page.getByRole("button", { name: "Program actions" }).click();
		await page.getByRole("menuitem", { name: "Add Exercises" }).click();
		await expect(page.getByRole("heading", { name: "Add Exercises" })).toBeVisible();
		const addExercisesDialog = page.getByRole("dialog");

		await addExercisesDialog.getByRole("button", { name: "All" }).click();
		await addExercisesDialog.getByPlaceholder("Search exercises...").fill(exerciseOne);
		await addExercisesDialog.getByText(exerciseOne).first().click();
		await addExercisesDialog.getByPlaceholder("Search exercises...").fill(exerciseTwo);
		await addExercisesDialog.getByText(exerciseTwo).first().click();
		await addExercisesDialog.getByRole("button", { name: "Confirm (2) exercises" }).click();

		await expect(page.getByText("Exercises updated successfully.")).toBeVisible();
		await expect(page.getByText(exerciseOne).first()).toBeVisible();
		await expect(page.getByText(exerciseTwo).first()).toBeVisible();
	});
});
