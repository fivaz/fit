import { ROUTES } from "@/lib/consts";
import { expect, test } from "@/tests/e2e/fixtures";
import { signUpAndLoginTestUser } from "@/tests/e2e/helpers/auth";
import { createProgram } from "@/tests/e2e/helpers/entities";
import { openProgramFromList } from "@/tests/e2e/helpers/program-workout";

// Matches any request to the Nest API, e.g. "http://localhost:3001/api/programs". The static web
// app has no /api routes of its own, so only API calls match.
const API_URL = /\/api\//;
/** Like a scaled-to-zero container booting: requests hang instead of failing. */
const COLD_START_MS = 20_000;
/** Cached data should be on screen well before the API answers. */
const FROM_CACHE_MS = 3_000;

test.describe("Offline cache", () => {
	test.skip(
		process.env.NEXT_PUBLIC_OFFLINE_ENABLED === "false",
		"Offline mode is disabled (NEXT_PUBLIC_OFFLINE_ENABLED=false in .env).",
	);
	test.setTimeout(60_000);

	test("Programs seen before stay available with the API unreachable", async ({
		page,
		request,
	}, testInfo) => {
		const programName = `Offline Program - ${testInfo.testId}`;

		await test.step("Create a program and open it once, online", async () => {
			await signUpAndLoginTestUser(page, request, "offline-cache");
			await createProgram(page, programName);
			await page.goto(ROUTES.PROGRAMS);
			await openProgramFromList(page, programName);
		});

		await test.step("Reopen the programs list with the API down", async () => {
			await page.route(API_URL, (route) => route.abort("connectionrefused"));
			await page.goto(ROUTES.PROGRAMS);
			await expect(page.getByRole("button", { name: `Open program ${programName}` })).toBeVisible();
		});

		await test.step("Open the program from the saved copy", async () => {
			await openProgramFromList(page, programName);
		});
	});

	test("Programs seen before show right away while the API is starting", async ({
		page,
		request,
	}, testInfo) => {
		const programName = `Cold Start Program - ${testInfo.testId}`;

		await test.step("Create a program and see it listed, online", async () => {
			await signUpAndLoginTestUser(page, request, "offline-cache-cold");
			await createProgram(page, programName);
			await page.goto(ROUTES.PROGRAMS);
			await expect(page.getByRole("button", { name: `Open program ${programName}` })).toBeVisible();
		});

		await test.step("Reopen the list while every API request hangs", async () => {
			await page.route(API_URL, async (route) => {
				await new Promise((resolve) => setTimeout(resolve, COLD_START_MS));
				// The test may have finished (and closed the page) while this request was held.
				await route.continue().catch(() => undefined);
			});
			await page.reload();
			await expect(page.getByRole("button", { name: `Open program ${programName}` })).toBeVisible({
				timeout: FROM_CACHE_MS,
			});
		});
	});
});
