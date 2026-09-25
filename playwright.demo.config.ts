import { defineConfig, devices } from "@playwright/test";

import "dotenv/config";

import {
	DEMO_COLOR_SCHEME,
	IPHONE_SCREEN,
	STORAGE_STATE_FILE,
	VIDEO_SIZE,
} from "./demos/support/paths";
import { webServer } from "./playwright.shared";

// Demos create real accounts and (optionally) spend OpenAI credits, so they must never run against a
// deployed API. `.env` may point API_BASE_URL at production, and dotenv doesn't override values that
// are already set, so force the local stack unconditionally rather than defaulting with `??=`.
const LOCAL_API = "http://localhost:3001";
const LOCAL_WEB = "http://localhost:3000";
process.env.API_BASE_URL = LOCAL_API;
process.env.NEXT_PUBLIC_API_BASE_URL = LOCAL_API;
process.env.NEXT_PUBLIC_AUTH_BASE_URL = LOCAL_API;
process.env.BETTER_AUTH_URL = LOCAL_API;
process.env.CORS_ALLOWED_ORIGINS = LOCAL_WEB;

// Playwright defaults this device to WebKit; the repo only installs Chromium, so drop the hint.
const { defaultBrowserType: _defaultBrowserType, ...iPhone } = devices["iPhone 15 Pro"];

export default defineConfig({
	testDir: "./demos",
	outputDir: "demo-output/test-results",
	fullyParallel: false,
	workers: 1,
	retries: 0,
	reporter: "list",
	timeout: 120_000,
	use: {
		baseURL: LOCAL_WEB,
		...iPhone,
		// The device descriptor's 393x659 viewport is Safari with its toolbars; the app runs full-screen
		// (its `screen` is already 393x852).
		viewport: IPHONE_SCREEN,
		colorScheme: DEMO_COLOR_SCHEME,
		locale: "en-US",
		timezoneId: "Europe/Zurich",
	},
	webServer,
	projects: [
		{
			name: "seed",
			// Matches the seeding file name, e.g. "demos/seed.setup.ts".
			testMatch: /seed\.setup\.ts$/,
			teardown: "cleanup",
		},
		{
			name: "cleanup",
			// Matches the teardown file name, e.g. "demos/cleanup.teardown.ts".
			testMatch: /cleanup\.teardown\.ts$/,
		},
		{
			name: "record",
			// Matches clip files, e.g. "demos/flow-workout.demo.ts".
			testMatch: /\.demo\.ts$/,
			dependencies: ["seed"],
			use: {
				storageState: STORAGE_STATE_FILE,
				video: { mode: "on", size: VIDEO_SIZE },
			},
		},
	],
});
