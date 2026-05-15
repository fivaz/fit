import { ROUTES } from "@/lib/consts";
import { expect, test } from "@/tests/e2e/fixtures";
import { signUpAndLoginTestUser } from "@/tests/e2e/helpers/auth";
import { createExercise, createProgram } from "@/tests/e2e/helpers/entities";
import {
	associateExercisesWithProgram,
	startWorkoutFromProgramPage,
	waitForWorkoutSynced,
} from "@/tests/e2e/helpers/program-workout";
import { fillWorkoutSet } from "@/tests/e2e/helpers/workout-sets";

async function waitForProgressStats(page: import("@playwright/test").Page) {
	const statsResponse = page.waitForResponse(
		(response) =>
			response.url().includes("/api/progress/stats") &&
			response.request().method() === "GET" &&
			response.ok(),
		{ timeout: 12_000 },
	);
	await page.goto(ROUTES.PROGRESS);
	await statsResponse;
	await expect(page.getByLabel("Workout count value")).toBeVisible({ timeout: 12_000 });
}

test.describe("Progress stats cards", () => {
	test("New user sees zeroed last-7-days stat cards", async ({ page, request }) => {
		await test.step("Authenticate and open Progress", async () => {
			await signUpAndLoginTestUser(page, request, "progress-stats-empty");
			await waitForProgressStats(page);
		});

		await test.step("Verify all four stat cards show zeros", async () => {
			await expect(page.getByRole("region", { name: "Workouts in the last 7 days" })).toBeVisible();
			await expect(page.getByLabel("Workout count value")).toHaveText("0");

			await expect(
				page.getByRole("region", { name: "Average workout duration in the last 7 days" }),
			).toBeVisible();
			await expect(page.getByLabel("Average workout minutes value")).toHaveText("0");

			await expect(
				page.getByRole("region", { name: "Average workout volume in the last 7 days" }),
			).toBeVisible();
			await expect(page.getByLabel("Average workout volume value")).toHaveText("0");

			await expect(
				page.getByRole("region", { name: "Average rest between sets in the last 7 days" }),
			).toBeVisible();
			await expect(page.getByLabel("Average rest between sets value")).toHaveText("0s");
		});
	});

	test("Finished workout updates all four last-7-days stat cards", async ({ page, request }) => {
		const exerciseName = `Progress Stats Exercise ${Date.now()}`;
		const programName = `Progress Stats Program ${Date.now()}`;

		await test.step("Authenticate and seed program with exercise", async () => {
			await signUpAndLoginTestUser(page, request, "progress-stats-workout");
			await createExercise(page, exerciseName);
			await createProgram(page, programName);
			await associateExercisesWithProgram(page, programName, [exerciseName]);
		});

		await test.step("Log two sets with known volume and rest gap", async () => {
			await startWorkoutFromProgramPage(page, programName);
			await fillWorkoutSet(page, 0, { reps: "10", weight: "50", time: "08:00" });
			await fillWorkoutSet(page, 1, { reps: "8", weight: "50", time: "08:03" });
		});

		await test.step("Sync and finish workout", async () => {
			await waitForWorkoutSynced(page);
			await page.getByRole("button", { name: "Finish" }).click();
			await expect(page.getByRole("heading", { name: "Finish Workout" })).toBeVisible();

			const statsResponse = page.waitForResponse(
				(response) =>
					response.url().includes("/api/progress/stats") &&
					response.request().method() === "GET" &&
					response.ok(),
				{ timeout: 12_000 },
			);
			await page.getByRole("button", { name: "Yes, finish" }).click();
			await expect(page).toHaveURL(
				new RegExp(`${ROUTES.PROGRESS.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`),
			);
			await statsResponse;
		});

		await test.step("Verify all four stat cards reflect the finished workout", async () => {
			await expect(page.getByLabel("Workout count value")).toBeVisible({ timeout: 12_000 });
			await expect(page.getByLabel("Workout count value")).toHaveText("1");
			await expect(page.getByLabel("Average workout volume value")).toHaveText("900");
			await expect(page.getByLabel("Average rest between sets value")).toHaveText("3.0m");

			const avgMinutes = Number(await page.getByLabel("Average workout minutes value").innerText());
			expect(avgMinutes).toBeGreaterThanOrEqual(0);
			expect(avgMinutes).toBeLessThanOrEqual(5);
		});
	});
});
