import { defineConfig, devices } from "@playwright/test";

import "dotenv/config";

import { webServer } from "./playwright.shared";

process.env.API_BASE_URL ??= "http://localhost:3001";
process.env.NEXT_PUBLIC_API_BASE_URL ??= process.env.API_BASE_URL;
process.env.NEXT_PUBLIC_AUTH_BASE_URL ??= process.env.API_BASE_URL;
process.env.BETTER_AUTH_URL ??= process.env.API_BASE_URL;
process.env.CORS_ALLOWED_ORIGINS ??= "http://localhost:3000";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
	testDir: "./tests/e2e",
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: 1,
	reporter: "list",
	use: {
		baseURL,
		trace: "on-first-retry",
	},
	webServer,
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
});
