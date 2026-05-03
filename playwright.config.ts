import { defineConfig, devices } from "@playwright/test";

import "dotenv/config";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3001";

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
	webServer: {
		// Own distDir (see package.json `dev:e2e`) so this server does not share `.next/dev/lock` with `pnpm dev` on :3000.
		command: "pnpm run dev:e2e",
		url: baseURL,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
});
