import type { Locator, Page } from "@playwright/test";

/** Human-feeling pause between visible actions (~350-600 ms, deterministic so re-records match). */
export async function beat(page: Page, ms = 450): Promise<void> {
	await page.waitForTimeout(ms);
}

/** Types character by character so the typing is visible in the recording (an instant fill isn't). */
export async function typeSlowly(target: Locator, text: string, delayMs = 70): Promise<void> {
	await target.click();
	await target.press("ControlOrMeta+a");
	await target.pressSequentially(text, { delay: delayMs });
}

/** Lets fonts and network settle so the first recorded frame isn't a half-loaded screen. */
export async function settle(page: Page): Promise<void> {
	await page.waitForLoadState("networkidle");
	await page.evaluate(() => document.fonts.ready);
}
