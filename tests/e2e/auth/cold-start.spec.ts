import type { Page } from "@playwright/test";

import { ROUTES } from "@/lib/consts";
import { expect, test } from "@/tests/e2e/fixtures";
import { signUpAndLoginTestUser } from "@/tests/e2e/helpers/auth";
import { expectHomePageVisible } from "@/tests/e2e/helpers/home";

/** Longer than the dashboard's 12s session gate timeout, like a scaled-to-zero API booting. */
const COLD_START_MS = 15_000;
/** How quickly a returning user should see the app while the session check is still in flight. */
const INSTANT_OPEN_MS = 3_000;

// Matches Better Auth's session check, e.g. "http://localhost:3001/api/auth/get-session".
const GET_SESSION_URL = /\/api\/auth\/get-session(\?.*)?$/;

/** Holds every session check for `delayMs` before letting it reach the API. */
async function delaySessionChecks(page: Page, delayMs: number) {
	await page.route(GET_SESSION_URL, async (route) => {
		await new Promise((resolve) => setTimeout(resolve, delayMs));
		// The test may have finished (and closed the page) while this request was held.
		await route.continue().catch(() => undefined);
	});
}

/** Duration of a startup milestone (see lib/telemetry/startup-timing.ts), from the page load. */
async function readStartupMilestone(page: Page, milestone: string): Promise<number> {
	return page.evaluate(
		(name) => performance.getEntriesByName(name, "measure")[0]?.duration ?? Number.NaN,
		milestone,
	);
}

test.describe("API cold start", () => {
	test.setTimeout(60_000);

	test("A returning user opens the app while the session check is still waiting", async ({
		page,
		request,
	}) => {
		await test.step("Sign in once on this device", async () => {
			await signUpAndLoginTestUser(page, request, "cold-start-returning");
			await expectHomePageVisible(page);
		});

		await test.step("Reopen the app with a cold API", async () => {
			await delaySessionChecks(page, COLD_START_MS);
			await page.reload();
			await expect(page.getByText("Welcome back,")).toBeVisible({ timeout: INSTANT_OPEN_MS });
		});

		await test.step("Stay signed in past the gate timeout, until the API answers", async () => {
			await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
				timeout: COLD_START_MS + 5_000,
			});
			await expect(page).toHaveURL(new RegExp(`${ROUTES.HOME}$`));
		});

		await test.step("Report the startup timings sent to Sentry", async () => {
			const dashboardShownMs = await readStartupMilestone(page, "app.dashboard_shown");
			const sessionResolvedMs = await readStartupMilestone(page, "app.session_resolved");
			expect(dashboardShownMs).toBeLessThan(INSTANT_OPEN_MS);
			expect(sessionResolvedMs).toBeGreaterThanOrEqual(COLD_START_MS);
		});
	});

	test("A network failure during the session check doesn't sign the user out", async ({
		page,
		request,
	}) => {
		await test.step("Sign in once on this device", async () => {
			await signUpAndLoginTestUser(page, request, "cold-start-offline");
			await expectHomePageVisible(page);
		});

		await test.step("Reopen the app without reaching the API", async () => {
			await page.route(GET_SESSION_URL, (route) => route.abort("connectionrefused"));
			await page.reload();
			await expectHomePageVisible(page);
			await expect(page).not.toHaveURL(new RegExp(`${ROUTES.LOGIN}$`));
		});
	});

	test("Without a remembered session, a slow API shows a wake-up message, then the app", async ({
		page,
		request,
	}) => {
		await test.step("Sign in, then forget this device's sign-in hint", async () => {
			await signUpAndLoginTestUser(page, request, "cold-start-new-device");
			await expectHomePageVisible(page);
			await page.evaluate(() => window.localStorage.removeItem("fit:last-session:v1"));
		});

		await test.step("Reopen the app with a cold API", async () => {
			await delaySessionChecks(page, COLD_START_MS);
			await page.reload();
			await expect(page.getByText("Waking up the server...")).toBeVisible({
				timeout: COLD_START_MS,
			});
			await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
		});

		await test.step("Open the app once the API answers", async () => {
			await expectHomePageVisible(page);
			await expect(page).toHaveURL(new RegExp(`${ROUTES.HOME}$`));
		});
	});
});
