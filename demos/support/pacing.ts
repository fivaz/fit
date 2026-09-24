import type { Locator, Page } from "@playwright/test";

/** How long a viewer needs to take a screen in (reading time), and to follow a transition. */
export const HOLD = { glance: 1500, read: 2500, linger: 3500 } as const;
export const BEAT = 900;

/** Human-feeling pause between visible actions. */
export async function beat(page: Page, ms: number = BEAT): Promise<void> {
	await page.waitForTimeout(ms);
}

/** Types character by character so the typing is visible in the recording (an instant fill isn't). */
export async function typeSlowly(target: Locator, text: string, delayMs = 110): Promise<void> {
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
}
