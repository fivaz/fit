import { ROUTES } from "@/lib/consts";
import { expect, test } from "@/tests/e2e/fixtures";

// Matches any request to the Nest API, e.g. "http://localhost:3001/api/health". The static web app
// has no /api routes of its own, so only API calls match.
const API_URL = /\/api\//;

const CONNECTED = { name: "Connected to the server" };
const STARTING = { name: /^Server starting/ };
const UNREACHABLE = { name: /^Can't reach the server/ };

// The dot lives in the root layout, so the login screen (no account needed) shows every state.
test.describe("API status dot", () => {
	test("Shows connected once the API answers", async ({ page }) => {
		await test.step("Open the app", async () => {
			await page.goto(ROUTES.LOGIN);
		});

		await test.step("The dot reports a connected server", async () => {
			await expect(page.getByRole("status", CONNECTED)).toBeVisible();
		});
	});

	test("Shows starting while the API is slow, then connected", async ({ page }) => {
		await test.step("Open the app with an API that takes 6s to answer", async () => {
			await page.route(API_URL, async (route) => {
				await new Promise((resolve) => setTimeout(resolve, 6_000));
				// The test may have finished (and closed the page) while this request was held.
				await route.continue().catch(() => undefined);
			});
			await page.goto(ROUTES.LOGIN);
			await expect(page.getByRole("status", STARTING)).toBeVisible();
		});

		await test.step("Turns connected when the API answers", async () => {
			await expect(page.getByRole("status", CONNECTED)).toBeVisible({ timeout: 15_000 });
		});
	});

	test("Shows unreachable when the API can't be reached", async ({ page }) => {
		await test.step("Open the app with the API down", async () => {
			await page.route(API_URL, (route) => route.abort("connectionrefused"));
			await page.goto(ROUTES.LOGIN);
		});

		await test.step("The dot reports an unreachable server", async () => {
			await expect(page.getByRole("status", UNREACHABLE)).toBeVisible();
		});
	});
});
