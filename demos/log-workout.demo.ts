import { ROUTES } from "@/lib/consts";
import {
	openProgramFromList,
	startWorkoutFromProgramPage,
} from "@/tests/e2e/helpers/program-workout";

import { expect, test } from "./support/fixtures";
import { beat, HOLD, settle, typeSlowly } from "./support/pacing";

const PROGRAM = "Push Day A";

// One journey, kept short for a portfolio: log today's training, then review it on Progress.
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

	await test.step("Log a set", async () => {
		const spinbuttons = page.getByRole("spinbutton");
		await typeSlowly(spinbuttons.nth(0), "8");
		await beat(page, 300);
		await typeSlowly(spinbuttons.nth(1), "70");
		await beat(page, 400);
		// Tapping the clock stamps the set as done now, so it counts toward volume on Progress.
		await page.getByRole("button", { name: "Set time" }).first().click();
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
		await beat(page, HOLD.linger);
	});
});
