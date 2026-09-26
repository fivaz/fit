import fs from "node:fs";
import path from "node:path";

import type { Page } from "@playwright/test";

import { ROUTES } from "@/lib/consts";
import {
	openProgramFromList,
	startWorkoutFromProgramPage,
} from "@/tests/e2e/helpers/program-workout";

import { expect, test } from "./support/fixtures";
import { addMinutes, setTimeByLongPress, settle } from "./support/pacing";
import { SCREENSHOTS_DIR } from "./support/paths";

const PROGRAM = "Push Day A";

/** Saves the visible screen at App Store size (1320x2868) once the page has settled. */
async function capture(page: Page, name: string): Promise<void> {
	await settle(page);
	// Let entry animations and the tap-indicator ripple (750ms) finish before the shot.
	await page.waitForTimeout(1_200);
	await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${name}.png`) });
}

// App Store screenshots of the seeded demo account (Alex Morgan, ~8 weeks of history).
test("app-store", async ({ page }) => {
	fs.rmSync(SCREENSHOTS_DIR, { recursive: true, force: true });
	fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

	await test.step("Home", async () => {
		await page.goto(ROUTES.HOME);
		await expect(page.getByText("Welcome back,")).toBeVisible();
		await capture(page, "01-home");
	});

	await test.step("Programs", async () => {
		await page.goto(ROUTES.PROGRAMS);
		await expect(page.getByRole("button", { name: `Open program ${PROGRAM}` })).toBeVisible();
		await capture(page, "02-programs");
	});

	await test.step("A workout in progress", async () => {
		await openProgramFromList(page, PROGRAM);
		await startWorkoutFromProgramPage(page, PROGRAM);
		const spinbuttons = page.getByRole("spinbutton");
		const setTimeButtons = page.getByRole("button", { name: "Set time" });
		// Warmup (already flagged from the seeded history), then two working sets, all stamped done.
		// Heavier than the history's best, so the charts end on a new high for weight and volume.
		const sets = [
			{ reps: "12", weight: "50" },
			{ reps: "9", weight: "72.5" },
			{ reps: "8", weight: "72.5" },
		];
		let firstSetTime = "";
		for (const [row, set] of sets.entries()) {
			await spinbuttons.nth(row * 2).fill(set.reps);
			await spinbuttons.nth(row * 2 + 1).fill(set.weight);
			if (row === 0) {
				// A tap stamps the first set now; the later ones are spaced 2 minutes apart, like rests.
				await setTimeButtons.nth(row).click();
				firstSetTime = (await setTimeButtons.nth(row).innerText()).trim();
			} else {
				await setTimeByLongPress(page, setTimeButtons.nth(row), addMinutes(firstSetTime, row * 2));
			}
		}
		await expect(page.getByLabel("synced-icon")).toBeVisible({ timeout: 12_000 });
		await capture(page, "03-workout");
	});

	await test.step("Progress, with the workout just finished", async () => {
		await page.getByRole("button", { name: "Finish" }).click();
		await page.getByRole("button", { name: "Yes, finish" }).click();
		// Finishing lands on Progress, where today now lists the workout.
		await expect(page.getByRole("heading", { name: "Progress" })).toBeVisible();
		await expect(page.getByRole("link", { name: `View workout ${PROGRAM}` })).toBeVisible();
		// Matches the finish toast, e.g. "Workout finished on Sep 26, 2026, 8:26:01 AM".
		await expect(page.getByText(/Workout finished on/i)).toBeHidden({ timeout: 10_000 });
		await capture(page, "04-progress");
	});

	await test.step("Exercise progress", async () => {
		await page.goto(ROUTES.PROGRAMS);
		await openProgramFromList(page, PROGRAM);
		await page.getByRole("link", { name: "Exercise progress" }).click();
		await expect(page.getByRole("heading", { name: "Exercise progress" })).toBeVisible();
		await capture(page, "05-exercise-progress");
	});

	await test.step("AI coach", async () => {
		await page.goto(ROUTES.PROGRAMS);
		await page.getByRole("button", { name: "Create program", exact: true }).click();
		await expect(page.getByRole("heading", { name: "Create Program" })).toBeVisible();
		await page
			.getByLabel("Workout description")
			.fill("A 4-day upper/lower split to build muscle, 45-minute sessions, full gym.");
		await capture(page, "06-ai-coach");
	});
});
