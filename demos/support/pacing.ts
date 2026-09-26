import type { Locator, Page } from "@playwright/test";

/**
 * How long a viewer needs to take a screen in (reading time), and to follow a transition. Kept short:
 * portfolio visitors give a clip roughly 10 seconds before scrolling on.
 */
export const HOLD = { glance: 900, read: 1500, linger: 2500 } as const;
export const BEAT = 600;

/** Human-feeling pause between visible actions. */
export async function beat(page: Page, ms: number = BEAT): Promise<void> {
	await page.waitForTimeout(ms);
}

/** Types character by character so the typing is visible in the recording (an instant fill isn't). */
export async function typeSlowly(target: Locator, text: string, delayMs = 80): Promise<void> {
	await target.click();
	await target.press("ControlOrMeta+a");
	await target.pressSequentially(text, { delay: delayMs });
}

/** Lets fonts and network settle so the first recorded frame isn't a half-loaded screen. */
export async function settle(page: Page): Promise<void> {
	await page.waitForLoadState("networkidle");
	await page.evaluate(() => document.fonts.ready);
}

/** Scrolls the page in small wheel steps, pausing between them, like a thumb flick. */
export async function scrollGently(page: Page, totalPx: number, steps = 4): Promise<void> {
	await page.mouse.move(196, 500);
	for (let step = 0; step < steps; step += 1) {
		await page.mouse.wheel(0, totalPx / steps);
		await page.waitForTimeout(450);
	}
	// A real thumb lifts off; a parked mouse would keep hovering a chart and show its tooltip.
	await page.mouse.move(0, 0);
}

/** How long the set-time button must be held before it turns into a time field (see TimeInput). */
const LONG_PRESS_MS = 700;

/**
 * Logs a set at a chosen time instead of now: a long press on the set's time button opens a time
 * field (a quick tap would stamp the current time), which takes "HH:mm".
 */
export async function setTimeByLongPress(page: Page, button: Locator, time: string): Promise<void> {
	const box = await button.boundingBox();
	if (!box) throw new Error("Set time button is not visible");
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.down();
	await page.waitForTimeout(LONG_PRESS_MS);
	await page.mouse.up();
	const timeField = page.getByLabel("Set time input");
	await timeField.fill(time);
	// Leaving the field closes it and shows the time on the button again.
	await timeField.blur();
}

/** Adds minutes to an "HH:mm" time, wrapping past midnight. */
export function addMinutes(time: string, minutes: number): string {
	const [hours, mins] = time.split(":").map(Number);
	const total = (((hours * 60 + mins + minutes) % 1440) + 1440) % 1440;
	return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
