import fs from "node:fs";

import { expect, test as base } from "@playwright/test";

import { rawClipPath, RAW_DIR } from "./paths";
import { installDemoOverlays } from "./tap-indicator";

/**
 * Same `page` fixture, but with the demo overlays installed and the recorded video saved to
 * demo-output/raw/<clip>.webm when the test ends (named after the test title).
 */
const test = base.extend({
	page: async ({ page }, use, testInfo) => {
		await installDemoOverlays(page);
		await use(page);

		const video = page.video();
		await page.close();
		// A skipped test (e.g. the opt-in AI clip) still records a blank stub; don't keep it.
		if (video && testInfo.status !== "skipped") {
			fs.mkdirSync(RAW_DIR, { recursive: true });
			await video.saveAs(rawClipPath(testInfo.title));
		}
	},
});

export { expect, test };
