import { expect, test } from "@/tests/e2e/fixtures";
import { signUpAndLoginTestUser } from "@/tests/e2e/helpers/auth";
import { createExercise, createProgram } from "@/tests/e2e/helpers/entities";
import { waitForWorkoutSynced } from "@/tests/e2e/helpers/program-workout";

test.describe("Workout Logging", () => {
	test("Authenticated user can start a workout and log set data", async ({ page, request }) => {
		await test.step("Authenticate user", async () => {
			await signUpAndLoginTestUser(page, request, "workout-start-log");
		});

		const exerciseName = `Workout Exercise ${Date.now()}`;
		const programName = `Workout Program ${Date.now()}`;

		await test.step("Create exercise and program", async () => {
			await createExercise(page, exerciseName);
			await createProgram(page, programName);
		});

		await test.step("Associate exercise with program", async () => {
			await page.getByRole("button", { name: `Open program ${programName}` }).click();
			await expect(page.getByRole("heading", { name: programName })).toBeVisible();

			await page.getByRole("button", { name: "Program actions" }).click();
			await page.getByRole("menuitem", { name: "Add Exercises" }).click();
			const addExercisesDialog = page.getByRole("dialog");
			await addExercisesDialog.getByRole("button", { name: "All" }).click();
			await addExercisesDialog
				.getByRole("textbox", { name: "Search exercises..." })
				.fill(exerciseName);
			await addExercisesDialog.getByText(exerciseName).first().click();
			await addExercisesDialog.getByRole("button", { name: "Confirm (1) exercises" }).click();
			await expect(page.getByText("Exercises updated successfully.")).toBeVisible();
		});

		await test.step("Start workout and log set values", async () => {
			await page.getByRole("button", { name: "Start Workout" }).click();
			// `toHaveURL(/\/workout\/.+/)` accepts any generated workout id path (e.g., `/workout/abc123`) and rejects non-workout or empty-id paths (e.g., `/workouts/abc123`, `/workout/`).
			await expect(page).toHaveURL(/\/workout\/.+/);
			await expect(page.getByRole("heading", { name: programName })).toBeVisible();

			const repsInput = page.getByRole("spinbutton").first();
			const weightInput = page.getByRole("spinbutton").nth(1);
			const timeButton = page.getByRole("button", { name: "Set time" }).first();

			await repsInput.fill("10");
			await weightInput.fill("42.5");
			await expect(repsInput).toHaveValue("10");
			await expect(weightInput).toHaveValue("42.5");

			// Quick click should set current time.
			await timeButton.click();
			// `toHaveText(/\d{2}:\d{2}/)` enforces zero-padded HH:MM output (e.g., `08:30`) and rejects non-padded/invalid formats (e.g., `8:30`, `0830`) because the button shows formatted clock time.
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

			const timeInput = page.getByLabel("Set time input").first();
			await expect(timeInput).toBeVisible();
			await timeInput.fill("08:30");
			await timeInput.blur();
			await expect(timeButton).toHaveText("08:30");
		});

		await test.step("Wait for sync and verify persisted values", async () => {
			await waitForWorkoutSynced(page);

			await page.reload();
			await expect(page.getByRole("spinbutton").first()).toHaveValue("10");
			await expect(page.getByRole("spinbutton").nth(1)).toHaveValue("42.5");
			await expect(page.getByRole("button", { name: "Set time" }).first()).toHaveText("08:30");
		});
	});
});
