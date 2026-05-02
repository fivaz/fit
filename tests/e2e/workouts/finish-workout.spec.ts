import { expect, test } from "@playwright/test";

import { ROUTES } from "@/lib/consts";
import { signUpAndLoginTestUser } from "@/tests/e2e/helpers/auth";
import { createExercise, createProgram } from "@/tests/e2e/helpers/entities";
import {
	associateExercisesWithProgram,
	startWorkoutFromProgramPage,
	waitForWorkoutSynced,
} from "@/tests/e2e/helpers/program-workout";

test.describe("Finish workout", () => {
	test("Authenticated user can finish workout and land on Progress", async ({ page, request }) => {
		const exerciseName = `Finish Flow Exercise ${Date.now()}`;
		const programName = `Finish Flow Program ${Date.now()}`;

		await test.step("Authenticate and seed program with exercise", async () => {
			await signUpAndLoginTestUser(page, request, "workout-finish");
			await createExercise(page, exerciseName);
			await createProgram(page, programName);
			await associateExercisesWithProgram(page, programName, [exerciseName]);
		});

		await test.step("Start workout and log minimal set data", async () => {
			await startWorkoutFromProgramPage(page, programName);
			await page.getByRole("spinbutton").first().fill("8");
			await expect(page.getByRole("spinbutton").first()).toHaveValue("8");
		});

		await test.step("Wait for sync before finishing", async () => {
			await waitForWorkoutSynced(page);
		});

		await test.step("Finish workout and confirm", async () => {
			await page.getByRole("button", { name: "Finish" }).click();
			await expect(page.getByRole("heading", { name: "Finish Workout" })).toBeVisible();
			await page.getByRole("button", { name: "Yes, finish" }).click();
		});

		await test.step("Verify redirect to Progress", async () => {
			await expect(page).toHaveURL(new RegExp(`${ROUTES.PROGRESS.replace("/", "\\/")}$`));
			await expect(page.getByRole("heading", { name: "Progress" })).toBeVisible();
			await expect(page.getByText(/Workout finished on/i)).toBeVisible();
		});
	});
});
