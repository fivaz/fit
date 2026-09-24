import type { PlaywrightTestConfig } from "@playwright/test";

/** Local Nest (:3001) + Next (:3000) dev servers, shared by the E2E and demo-recording configs. */
export const webServer: NonNullable<PlaywrightTestConfig["webServer"]> = [
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
];
