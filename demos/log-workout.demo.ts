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

	await test.step("Log a warmup set, then a heavier working set", async () => {
		const spinbuttons = page.getByRole("spinbutton");
		const setTimeButtons = page.getByRole("button", { name: "Set time" });
		// Warmup sets are left out of the progress charts, so only the working set counts there.
		await page.getByRole("button", { name: "Toggle warmup set" }).first().click();
		await beat(page, 400);
		await typeSlowly(spinbuttons.nth(0), "12");
		await beat(page, 300);
		await typeSlowly(spinbuttons.nth(1), "50");
		await beat(page, 400);
		// Tapping the clock stamps the set as done now, so it counts toward volume on Progress.
		await setTimeButtons.nth(0).click();
		await beat(page, HOLD.glance);
		await typeSlowly(spinbuttons.nth(2), "8");
		await beat(page, 300);
		// A little above the seeded history's best, so today shows up as a new high on the chart.
		await typeSlowly(spinbuttons.nth(3), "72.5");
		await beat(page, 400);
		await setTimeButtons.nth(1).click();
		await beat(page, HOLD.glance);
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
