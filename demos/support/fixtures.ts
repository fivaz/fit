import fs from "node:fs";

import { expect, test as base } from "@playwright/test";

import { cutsPath, DEMO_COLOR_SCHEME, rawClipPath, RAW_DIR, SAFE_AREA_INSETS } from "./paths";
import { reseedDemoData } from "./reseed";
import { installDemoOverlays } from "./tap-indicator";

export type Cut = { from: number; to: number };

type DemoTimeline = {
	/** Seconds since the clip started, for describing a stretch of dead time to cut later. */
	now: () => number;
	/** Removes the [from, to] seconds of the recording during conversion (e.g. waiting on OpenAI). */
	cut: (from: number, to: number) => void;
};

/**
 * Same `page` fixture, but with the demo overlays and iPhone safe-area insets installed, and the
 * recorded video saved to demo-output/raw/<clip>.webm when the test ends (named after the test
 * title). A `clock` fixture lets a clip mark stretches to cut out in post.
 */
const test = base.extend<{ timeline: DemoTimeline; resetDemoData: void }>({
	// Auto fixtures are set up before `page`, so the ~1s reseed happens before the video starts
	// instead of showing up as blank frames at the head of the recording.
	resetDemoData: [
		async ({}, use, testInfo) => {
			// Skipped clips (e.g. the opt-in AI one) shouldn't touch the DB.
			if (testInfo.title === "ai-coach" && !process.env.DEMO_AI) {
				await use();
				return;
			}
			// The payment clip opens on the paywall, which only shows once the free credits are gone.
			reseedDemoData(testInfo.title === "payment" ? 0 : undefined);
			await use();
		},
		{ auto: true },
	],
	page: async ({ page }, use, testInfo) => {
		await installDemoOverlays(page);
		// Chromium reports 0 for env(safe-area-inset-*); emulate the real iPhone 15 Pro insets so the
		// app's header and bottom navigation get the padding they get on a device.
		const emulateDevice = async () => {
			const session = await page.context().newCDPSession(page);
			await session.send("Emulation.setSafeAreaInsetsOverride", { insets: SAFE_AREA_INSETS });
			await session.detach();
			await page.emulateMedia({ colorScheme: DEMO_COLOR_SCHEME });
		};
		await emulateDevice();
		// Coming back from a cross-origin page (Stripe Checkout) swaps the renderer process, which drops
		// both the insets and the context's dark color scheme, so the app would return in light mode.
		page.on("framenavigated", (frame) => {
			if (frame !== page.mainFrame()) return;
			// The page may already be closing when a late navigation fires; nothing to restore then.
			emulateDevice().catch(() => undefined);
		});

		await use(page);

		const video = page.video();
		await page.close();
		// A skipped test (e.g. the opt-in AI clip) still records a blank stub; don't keep it.
		if (video && testInfo.status !== "skipped") {
			fs.mkdirSync(RAW_DIR, { recursive: true });
			await video.saveAs(rawClipPath(testInfo.title));
		}
	},
	timeline: async ({}, use, testInfo) => {
		const startedAt = Date.now();
		const cuts: Cut[] = [];
		await use({
			now: () => (Date.now() - startedAt) / 1000,
			cut: (from, to) => cuts.push({ from, to }),
		});
		if (cuts.length > 0 && testInfo.status !== "skipped") {
			fs.mkdirSync(RAW_DIR, { recursive: true });
			fs.writeFileSync(cutsPath(testInfo.title), JSON.stringify(cuts));
		}
	},
});

export { expect, test };
