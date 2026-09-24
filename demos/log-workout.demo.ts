import { ROUTES } from "@/lib/consts";
import {
	openProgramFromList,
	startWorkoutFromProgramPage,
} from "@/tests/e2e/helpers/program-workout";

import { expect, test } from "./support/fixtures";
import { beat, HOLD, settle, typeSlowly } from "./support/pacing";

const PROGRAM = "Push Day A";

// Starts and ends on Progress so the looped clip's last frame resembles its first.
test("log-workout", async ({ page }) => {
	await test.step("Open on Progress (first frame)", async () => {
		await page.goto(ROUTES.PROGRESS);
		await expect(page.getByRole("heading", { name: "Progress" })).toBeVisible();
		await settle(page);
		await beat(page, HOLD.read);
	});

	await test.step("Go to the program", async () => {
		await page.getByRole("link", { name: "Programs" }).click();
		await expect(page.getByRole("button", { name: `Open program ${PROGRAM}` })).toBeVisible();
		await beat(page, HOLD.read);
		await openProgramFromList(page, PROGRAM);
		await beat(page, HOLD.read);
	});

	await test.step("Start the workout", async () => {
		await startWorkoutFromProgramPage(page, PROGRAM);
		await beat(page, HOLD.read);
	});

	await test.step("Log two sets", async () => {
		const spinbuttons = page.getByRole("spinbutton");
		const setTimeButtons = page.getByRole("button", { name: "Set time" });
		await typeSlowly(spinbuttons.nth(0), "8");
		await beat(page, 500);
		await typeSlowly(spinbuttons.nth(1), "70");
		await beat(page, 600);
		// Tapping the clock stamps the set as done now, so it counts toward volume on Progress.
		await setTimeButtons.nth(0).click();
		await beat(page, HOLD.glance);
		await typeSlowly(spinbuttons.nth(2), "8");
		await beat(page, 500);
		await typeSlowly(spinbuttons.nth(3), "70");
		await beat(page, 600);
		await setTimeButtons.nth(1).click();
		await beat(page, HOLD.read);
	});

	await test.step("Wait for sync", async () => {
		// With human pacing the debounced sync request has usually finished already, so wait on the
		// settled indicator rather than on the request itself.
		await expect(page.getByLabel("synced-icon")).toBeVisible({ timeout: 12_000 });
		await beat(page, HOLD.glance);
	});

	await test.step("Finish and confirm", async () => {
		await page.getByRole("button", { name: "Finish" }).click();
		await expect(page.getByRole("heading", { name: "Finish Workout" })).toBeVisible();
		await beat(page, HOLD.read);
		await page.getByRole("button", { name: "Yes, finish" }).click();
	});

	await test.step("Land on Progress (last frame)", async () => {
		// Matches the Progress route URL, anchored with $ so it must end exactly there.
		await expect(page).toHaveURL(new RegExp(`${ROUTES.PROGRESS}$`));
		await expect(page.getByRole("heading", { name: "Progress" })).toBeVisible();
		// Matches the finish toast, e.g. "Workout finished on Sep 24, 2026, 6:01:06 PM". It overlaps
		// the page heading, so let it dismiss before the last frame to keep the loop seam clean.
		await expect(page.getByText(/Workout finished on/i)).toBeHidden({ timeout: 10_000 });
		await settle(page);
		await beat(page, HOLD.linger);
	});
});
