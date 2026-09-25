import { ROUTES } from "@/lib/consts";
import { expect, test } from "@/tests/e2e/fixtures";
import { signUpAndLoginTestUser } from "@/tests/e2e/helpers/auth";
import { createExercise, createProgram } from "@/tests/e2e/helpers/entities";
import {
	associateExercisesWithProgram,
	startWorkoutFromProgramPage,
	waitForWorkoutSynced,
} from "@/tests/e2e/helpers/program-workout";

test.describe("Finish workout", () => {
	test("Authenticated user can finish workout, land on Progress and open its exercise progress", async ({
		page,
		request,
	}) => {
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
			const escapedProgressRoute = ROUTES.PROGRESS.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			// Matches the exact Progress route URL with an end-of-string anchor ($).
			await expect(page).toHaveURL(new RegExp(`${escapedProgressRoute}$`));
			await expect(page.getByRole("heading", { name: "Progress" })).toBeVisible();
			await expect(page.getByText(/Workout finished on/i)).toBeVisible();
		});

		await test.step("Open the finished workout's exercise progress", async () => {
			await page.getByRole("link", { name: `View workout ${programName}` }).click();
			await expect(page.getByRole("heading", { name: programName })).toBeVisible();
			await page.getByRole("link", { name: "Exercise progress" }).click();

			// Matches the program progress route, e.g. "/programs/progress?id=<uuid>".
			await expect(page).toHaveURL(/\/programs\/progress\?id=/);
			await expect(page.getByRole("heading", { name: "Exercise progress" })).toBeVisible();
			await expect(page.getByText(exerciseName)).toBeVisible();
		});
	});
});
