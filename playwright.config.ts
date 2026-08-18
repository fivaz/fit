import { defineConfig, devices } from "@playwright/test";

import "dotenv/config";

process.env.NEXT_PUBLIC_API_BASE_URL ??= "http://localhost:3001";
process.env.NEXT_PUBLIC_AUTH_BASE_URL ??= "http://localhost:3001";
process.env.BETTER_AUTH_URL ??= "http://localhost:3001";
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
	webServer: [
		{
			command: "pnpm --filter @fit/api dev",
			url: "http://localhost:3001/api/health",
			reuseExistingServer: !process.env.CI,
			timeout: 120_000,
			stdout: "pipe",
			stderr: "pipe",
		},
		{
			command: "pnpm --filter @fit/web dev",
			url: "http://localhost:3000",
			reuseExistingServer: !process.env.CI,
			timeout: 120_000,
			stdout: "pipe",
			stderr: "pipe",
		},
	],
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
});
