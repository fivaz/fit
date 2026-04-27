import { expect, test } from "@playwright/test";

import { signUpAndLoginTestUser } from "@/tests/e2e/helpers/auth";
import { createExercise, createProgram } from "@/tests/e2e/helpers/entities";

test.describe("Workout Logging", () => {
	test("Authenticated user can start a workout and log set data", async ({ page, request }) => {
		await signUpAndLoginTestUser(page, request, "workout-start-log");

		const exerciseName = `Workout Exercise ${Date.now()}`;
		const programName = `Workout Program ${Date.now()}`;

		await createExercise(page, exerciseName);
		await createProgram(page, programName);

		await page.getByRole("link", { name: `Open program ${programName}` }).click();
		await expect(page.getByRole("heading", { name: programName })).toBeVisible();

		await page.getByRole("button", { name: "Program actions" }).click();
		await page.getByRole("menuitem", { name: "Add Exercises" }).click();
		const addExercisesDialog = page.getByRole("dialog");
		await addExercisesDialog.getByRole("button", { name: "All" }).click();
		await addExercisesDialog.getByPlaceholder("Search exercises...").fill(exerciseName);
		await addExercisesDialog.getByText(exerciseName).first().click();
		await addExercisesDialog.getByRole("button", { name: "Confirm (1) exercises" }).click();
		await expect(page.getByText("Exercises updated successfully.")).toBeVisible();

		await page.getByRole("button", { name: "Start Workout" }).click();
		await expect(page).toHaveURL(/\/workout\/.+/);
		await expect(page.getByRole("heading", { name: programName })).toBeVisible();

		const firstExerciseCard = page
			.locator("div")
			.filter({ has: page.getByRole("heading", { name: exerciseName }) })
			.first();
		const firstSetRow = firstExerciseCard.locator("div.mb-2.grid").nth(1);
		const repsInput = firstExerciseCard.getByRole("spinbutton").first();
		const weightInput = firstExerciseCard.getByRole("spinbutton").nth(1);
		const timeButton = firstSetRow.locator("button").nth(1);

		await repsInput.fill("10");
		await weightInput.fill("42.5");
		await expect(repsInput).toHaveValue("10");
		await expect(weightInput).toHaveValue("42.5");

		// Quick click should set current time.
		await timeButton.click();
		await expect(timeButton).toHaveText(/\d{2}:\d{2}/);

		// Long press should open time input and allow manual change.
		const timeButtonBox = await timeButton.boundingBox();
		if (!timeButtonBox) throw new Error("Unable to locate time button for long-press.");
		await page.mouse.move(
			timeButtonBox.x + timeButtonBox.width / 2,
			timeButtonBox.y + timeButtonBox.height / 2,
		);
		await page.mouse.down();
		await page.waitForTimeout(650);
		await page.mouse.up();

		const timeInput = firstSetRow.locator('input[type="time"]');
		await expect(timeInput).toBeVisible();
		await timeInput.fill("08:30");
		await timeInput.blur();
		await expect(timeButton).toHaveText("08:30");

		// Wait for debounce -> sync cycle (upload icon then synced icon).
		await page.waitForTimeout(1900);
		await expect(page.locator("header svg.text-orange-500").first()).toBeVisible({ timeout: 8000 });
		await expect(page.locator("header svg.text-green-500").first()).toBeVisible({ timeout: 12000 });

		await page.reload();

		const persistedExerciseCard = page
			.locator("div")
			.filter({ has: page.getByRole("heading", { name: exerciseName }) })
			.first();
		const persistedFirstSetRow = persistedExerciseCard.locator("div.mb-2.grid").nth(1);
		await expect(persistedExerciseCard.getByRole("spinbutton").first()).toHaveValue("10");
		await expect(persistedExerciseCard.getByRole("spinbutton").nth(1)).toHaveValue("42.5");
		await expect(persistedFirstSetRow.locator("button").nth(1)).toHaveText("08:30");
	});
});
