import { ROUTES } from "@/lib/consts";
import { openProgramFromList } from "@/tests/e2e/helpers/program-workout";

import { expect, test } from "./support/fixtures";
import { beat, HOLD, scrollGently, settle } from "./support/pacing";

const PROGRAM = "Push Day A";

// Starts and ends on Progress so the looped clip's last frame resembles its first.
test("progress", async ({ page }) => {
	await test.step("Open on Progress (first frame)", async () => {
		await page.goto(ROUTES.PROGRESS);
		await expect(page.getByRole("heading", { name: "Progress" })).toBeVisible();
		await settle(page);
		await beat(page, HOLD.linger);
	});

	await test.step("Scroll through the week", async () => {
		await scrollGently(page, 600);
		await beat(page, HOLD.read);
		await scrollGently(page, -600);
		await beat(page, HOLD.glance);
	});

	await test.step("Open the program's exercise progress", async () => {
		await page.getByRole("link", { name: "Programs" }).click();
		await expect(page.getByRole("button", { name: `Open program ${PROGRAM}` })).toBeVisible();
		await beat(page, HOLD.glance);
		await openProgramFromList(page, PROGRAM);
		await beat(page, HOLD.read);
		await page.getByRole("link", { name: "Exercise progress" }).click();
		await expect(page.getByRole("heading", { name: "Exercise progress" })).toBeVisible();
		await settle(page);
		await beat(page, HOLD.linger);
	});

	await test.step("Scroll through the charts", async () => {
		await scrollGently(page, 900, 6);
		await beat(page, HOLD.read);
	});

	await test.step("Back to Progress (last frame)", async () => {
		await page.getByRole("link", { name: "Progress" }).click();
		await expect(page.getByRole("heading", { name: "Progress" })).toBeVisible();
		await settle(page);
		await beat(page, HOLD.linger);
	});
});
