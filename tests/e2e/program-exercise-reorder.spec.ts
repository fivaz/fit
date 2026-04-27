import { expect, test } from "@playwright/test";

import {
	createExercise,
	createProgram,
	dragToTarget,
	ensureSharedTestUser,
	getSharedTestUser,
	loginWithEmailPassword,
} from "@/tests/e2e/helpers/flow-helpers";

test.describe.serial("Program exercise reorder", () => {
	const testUser = getSharedTestUser();

	test.beforeAll(async ({ request }) => {
		await ensureSharedTestUser(request, testUser);
	});

	test("Authenticated user can reorder exercises within a program", async ({ page }) => {
		await loginWithEmailPassword(page, testUser);

		const exerciseOne = `Reorder Exercise A ${Date.now()}`;
		const exerciseTwo = `Reorder Exercise B ${Date.now()}`;
		const programName = `Reorder Exercise Program ${Date.now()}`;

		await createExercise(page, exerciseOne);
		await createExercise(page, exerciseTwo);
		await createProgram(page, programName);
		await page.getByRole("link", { name: `Open program ${programName}` }).click();

		await page.getByRole("button", { name: "Program actions" }).click();
		await page.getByRole("menuitem", { name: "Add Exercises" }).click();
		const addExercisesDialog = page.getByRole("dialog");
		await addExercisesDialog.getByRole("button", { name: "All" }).click();
		await addExercisesDialog.getByPlaceholder("Search exercises...").fill(exerciseOne);
		await addExercisesDialog.getByText(exerciseOne).first().click();
		await addExercisesDialog.getByPlaceholder("Search exercises...").fill(exerciseTwo);
		await addExercisesDialog.getByText(exerciseTwo).first().click();
		await addExercisesDialog.getByRole("button", { name: "Confirm (2) exercises" }).click();
		await expect(page.getByText("Exercises updated successfully.")).toBeVisible();
		await expect(page.getByRole("button", { name: `Open exercise ${exerciseOne}` })).toBeVisible();
		await expect(page.getByRole("button", { name: `Open exercise ${exerciseTwo}` })).toBeVisible();

		const exerciseOpenButtons = page.getByRole("button", { name: /Open exercise / });
		const beforeOrder = await exerciseOpenButtons.evaluateAll((elements) =>
			elements.map((element) => element.getAttribute("aria-label") ?? ""),
		);
		const beforeFirstIndex = beforeOrder.findIndex((text) => text.includes(exerciseOne));
		const beforeSecondIndex = beforeOrder.findIndex((text) => text.includes(exerciseTwo));

		expect(beforeFirstIndex).toBeGreaterThanOrEqual(0);
		expect(beforeSecondIndex).toBeGreaterThanOrEqual(0);

		const firstExerciseHandle = page
			.getByRole("button", { name: `Open exercise ${exerciseOne}` })
			.locator(
				"xpath=ancestor::div[contains(@class,'flex items-stretch')]//button[@aria-label='Drag exercise to reorder']",
			)
			.first();
		const secondExerciseHandle = page
			.getByRole("button", { name: `Open exercise ${exerciseTwo}` })
			.locator(
				"xpath=ancestor::div[contains(@class,'flex items-stretch')]//button[@aria-label='Drag exercise to reorder']",
			)
			.first();

		await dragToTarget(page, firstExerciseHandle, secondExerciseHandle);
		await page.reload();

		const afterOrder = await page
			.getByRole("button", { name: /Open exercise / })
			.evaluateAll((elements) =>
				elements.map((element) => element.getAttribute("aria-label") ?? ""),
			);
		const afterFirstIndex = afterOrder.findIndex((text) => text.includes(exerciseOne));
		const afterSecondIndex = afterOrder.findIndex((text) => text.includes(exerciseTwo));

		expect(afterFirstIndex).toBeGreaterThanOrEqual(0);
		expect(afterSecondIndex).toBeGreaterThanOrEqual(0);
		expect(afterFirstIndex).toBeGreaterThan(beforeFirstIndex);
		expect(afterSecondIndex).toBeLessThan(beforeSecondIndex);
	});
});
