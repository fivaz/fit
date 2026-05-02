import { expect, test } from "@playwright/test";

import { signUpAndLoginTestUser } from "@/tests/e2e/helpers/auth";
import { createExercise, createProgram } from "@/tests/e2e/helpers/entities";
import {
	associateExercisesWithProgram,
	startWorkoutFromProgramPage,
} from "@/tests/e2e/helpers/program-workout";

test.describe("Workout advanced interactions", () => {
	test("Authenticated user can add set, toggle warmup, delete set with confirm, and open exercise details", async ({
		page,
		request,
	}) => {
		const exerciseName = `Advanced Exercise ${Date.now()}`;
		const programName = `Advanced Program ${Date.now()}`;

		await test.step("Authenticate and open active workout", async () => {
			await signUpAndLoginTestUser(page, request, "workout-advanced");
			await createExercise(page, exerciseName);
			await createProgram(page, programName);
			await associateExercisesWithProgram(page, programName, [exerciseName]);
			await startWorkoutFromProgramPage(page, programName);
		});

		await test.step("Add a set (default seed is 3 sets → 6 spinbuttons; +1 set → 8)", async () => {
			const before = await page.getByRole("spinbutton").count();
			await page.getByRole("button", { name: "Add Set" }).click();
			await expect(page.getByRole("spinbutton")).toHaveCount(before + 2);
		});

		await test.step("Toggle warmup on first set", async () => {
			await page.getByRole("button", { name: "Toggle warmup set" }).first().click();
		});

		await test.step("Delete second set when it has data (confirm dialog)", async () => {
			// Second set: reps index 2, weight index 3
			await page.getByRole("spinbutton").nth(3).fill("25");
			await expect(page.getByRole("spinbutton").nth(3)).toHaveValue("25");
			await page.getByRole("button", { name: "Delete set" }).nth(1).click();
			await expect(page.getByRole("heading", { name: "Delete Set" })).toBeVisible();
			await page.getByRole("button", { name: "Confirm" }).click();
			await expect(page.getByRole("spinbutton")).toHaveCount(6);
		});

		await test.step("Open exercise details drawer", async () => {
			await page.getByRole("button", { name: "View exercise details" }).click();
			await expect(
				page.getByRole("heading", { name: new RegExp(exerciseName, "i") }),
			).toBeVisible();
		});
	});
});
