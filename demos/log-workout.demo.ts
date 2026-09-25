import { ROUTES } from "@/lib/consts";
import {
	openProgramFromList,
	startWorkoutFromProgramPage,
} from "@/tests/e2e/helpers/program-workout";

import { expect, test } from "./support/fixtures";
import { beat, HOLD, scrollGently, settle, typeSlowly } from "./support/pacing";

const PROGRAM = "Push Day A";

// One journey: log today's training, then review it on Progress and in the exercise charts.
test("log-workout", async ({ page }) => {
	await test.step("Open the program", async () => {
		await page.goto(ROUTES.PROGRAMS);
		await expect(page.getByRole("button", { name: `Open program ${PROGRAM}` })).toBeVisible();
		await settle(page);
		await beat(page, HOLD.glance);
		await openProgramFromList(page, PROGRAM);
		await beat(page, HOLD.glance);
	});

	await test.step("Start the workout", async () => {
		await startWorkoutFromProgramPage(page, PROGRAM);
		await beat(page, HOLD.glance);
	});

	await test.step("Log a warmup set, then two heavier working sets", async () => {
		const spinbuttons = page.getByRole("spinbutton");
		const setTimeButtons = page.getByRole("button", { name: "Set time" });
		// Set 1 is already flagged as a warmup: a new workout copies the flags from the last session.
		// Warmups stay out of the progress charts, so only the working sets count there.
		await typeSlowly(spinbuttons.nth(0), "12");
		await beat(page, 300);
		await typeSlowly(spinbuttons.nth(1), "50");
		await beat(page, 400);
		// Tapping the clock stamps the set as done now, so it counts toward volume on Progress.
		await setTimeButtons.nth(0).click();
		await beat(page, HOLD.glance);
		// A little above the seeded history's best weight, with reps dropping off as fatigue sets in,
		// so today shows up as a new high for both weight and volume on the charts.
		for (const [row, reps] of [
			[1, "9"],
			[2, "8"],
		] as const) {
			await typeSlowly(spinbuttons.nth(row * 2), reps);
			await beat(page, 300);
			await typeSlowly(spinbuttons.nth(row * 2 + 1), "72.5");
			await beat(page, 400);
			await setTimeButtons.nth(row).click();
			await beat(page, HOLD.glance);
		}
	});

	await test.step("Finish and confirm", async () => {
		// With human pacing the debounced sync request has usually finished already, so wait on the
		// settled indicator rather than on the request itself.
		await expect(page.getByLabel("synced-icon")).toBeVisible({ timeout: 12_000 });
		await page.getByRole("button", { name: "Finish" }).click();
		await expect(page.getByRole("heading", { name: "Finish Workout" })).toBeVisible();
		await beat(page, HOLD.glance);
		await page.getByRole("button", { name: "Yes, finish" }).click();
	});

	await test.step("Review the week on Progress", async () => {
		// Matches the Progress route URL, anchored with $ so it must end exactly there.
		await expect(page).toHaveURL(new RegExp(`${ROUTES.PROGRESS}$`));
		await expect(page.getByRole("heading", { name: "Progress" })).toBeVisible();
		await settle(page);
		// Today's workout is listed under the week's stats, already in view: the page is barely taller
		// than the screen, so scrolling would only hit the bottom and bounce.
		await expect(page.getByRole("link", { name: `View workout ${PROGRAM}` })).toBeInViewport();
		await beat(page, HOLD.read);
	});

	await test.step("Open today's workout", async () => {
		await page.getByRole("link", { name: `View workout ${PROGRAM}` }).click();
		await expect(page.getByRole("heading", { name: PROGRAM })).toBeVisible();
		await settle(page);
		await beat(page, HOLD.read);
	});

	await test.step("Check the exercise progress", async () => {
		await page.getByRole("link", { name: "Exercise progress" }).click();
		await expect(page.getByRole("heading", { name: "Exercise progress" })).toBeVisible();
		await settle(page);
		await beat(page, HOLD.linger);
		await scrollGently(page, 250, 3);
		await beat(page, HOLD.linger);
	});
});
