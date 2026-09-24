import fs from "node:fs";
import path from "node:path";

import { expect, type Page, test as setup } from "@playwright/test";

import { ROUTES } from "@/lib/consts";
import { signUpAndLoginTestUser } from "@/tests/e2e/helpers/auth";
import { createExercise, createProgram } from "@/tests/e2e/helpers/entities";
import {
	associateExercisesWithProgram,
	openProgramFromList,
	startWorkoutFromProgramPage,
	waitForWorkoutSynced,
} from "@/tests/e2e/helpers/program-workout";
import { fillWorkoutSet, recentSetTimes } from "@/tests/e2e/helpers/workout-sets";

import { DEMO_PROGRAM } from "./support/data";
import { DEMO_STATE_FILE, RAW_DIR, STORAGE_STATE_FILE } from "./support/paths";

// Each muscle regex matches the muscle-group toggle button label in the create-exercise form,
// case-insensitively (e.g. /chest/i matches "Chest").
const EXERCISES: { name: string; muscle: RegExp }[] = [
	{ name: "Bench Press", muscle: /chest/i },
	{ name: "Incline Dumbbell Press", muscle: /chest/i },
	{ name: "Cable Fly", muscle: /chest/i },
	{ name: "Triceps Pushdown", muscle: /triceps/i },
];

/** Weights (kg) for the first exercise's two sets in each past workout: a plausible progression. */
const PAST_WORKOUTS: { reps: string; weight: string }[][] = [
	[
		{ reps: "8", weight: "55" },
		{ reps: "8", weight: "57.5" },
	],
	[
		{ reps: "8", weight: "57.5" },
		{ reps: "8", weight: "60" },
	],
	[
		{ reps: "8", weight: "60" },
		{ reps: "8", weight: "60" },
	],
];

async function logFinishedWorkout(page: Page, sets: { reps: string; weight: string }[]) {
	await page.goto(ROUTES.PROGRAMS);
	await openProgramFromList(page, DEMO_PROGRAM);
	await startWorkoutFromProgramPage(page, DEMO_PROGRAM);

	// Sets need a completion time to count toward volume/duration on Progress; anchor them to now.
	const [firstTime, secondTime] = recentSetTimes(12);
	const times = [firstTime, secondTime];
	for (const [index, set] of sets.entries()) {
		await fillWorkoutSet(page, index, { ...set, time: times[index] });
	}
	await waitForWorkoutSynced(page);

	await page.getByRole("button", { name: "Finish" }).click();
	await page.getByRole("button", { name: "Yes, finish" }).click();
	// Matches the Progress route URL, anchored with $ so it must end exactly there.
	await expect(page).toHaveURL(new RegExp(`${ROUTES.PROGRESS}$`));
}

setup("seed demo account", async ({ page, request }) => {
	// Not the E2E `test` from tests/e2e/fixtures: its auto fixture deletes the user when this test
	// ends, but the demo user has to outlive seeding. The cleanup project deletes it after recording.
	let email = "";

	// Start from a clean slate so clips from an earlier run can't be mistaken for fresh ones.
	fs.rmSync(RAW_DIR, { recursive: true, force: true });

	await setup.step("Sign up the demo user", async () => {
		const user = await signUpAndLoginTestUser(page, request, "portfolio-demo");
		email = user.email;
		// Written immediately so the cleanup project can delete the user even if seeding fails later.
		fs.mkdirSync(path.dirname(DEMO_STATE_FILE), { recursive: true });
		fs.writeFileSync(DEMO_STATE_FILE, JSON.stringify({ email }));
	});

	await setup.step("Seed exercises and the demo program", async () => {
		for (const { name, muscle } of EXERCISES) {
			await createExercise(page, name, muscle);
		}
		// Chest + Triceps, so the add-exercises dialog offers all four exercises.
		await createProgram(page, DEMO_PROGRAM, [/chest/i, /triceps/i]);
		await associateExercisesWithProgram(
			page,
			DEMO_PROGRAM,
			EXERCISES.map(({ name }) => name),
		);
	});

	await setup.step("Log finished past workouts so Progress isn't empty", async () => {
		for (const sets of PAST_WORKOUTS) {
			await logFinishedWorkout(page, sets);
		}
	});

	await setup.step("Save the logged-in session for the recordings", async () => {
		fs.mkdirSync(path.dirname(STORAGE_STATE_FILE), { recursive: true });
		await page.context().storageState({ path: STORAGE_STATE_FILE });
	});
});
