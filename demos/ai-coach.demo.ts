import { ROUTES } from "@/lib/consts";

import { expect, test } from "./support/fixtures";
import { beat, settle, typeSlowly } from "./support/pacing";

// Opt-in: this calls OpenAI and spends one of the demo account's credits.
test("ai-coach", async ({ page }) => {
	test.skip(!process.env.DEMO_AI, "Set DEMO_AI=1 to record the AI coach clip.");
	test.skip(!process.env.OPENAI_API_KEY, "OPENAI_API_KEY is not set.");

	await test.step("Open the programs list", async () => {
		await page.goto(ROUTES.PROGRAMS);
		await expect(page.getByRole("heading", { name: "Programs" })).toBeVisible();
		await settle(page);
		await beat(page, 900);
	});

	await test.step("Open Create Program in AI coach mode", async () => {
		await page.getByRole("button", { name: "Create program", exact: true }).click();
		await expect(page.getByRole("heading", { name: "Create Program" })).toBeVisible();
		await beat(page);
	});

	await test.step("Describe the workout", async () => {
		await typeSlowly(
			page.getByLabel("Workout description"),
			"A 3-day full body split focused on strength, 45-minute sessions.",
			45,
		);
		await beat(page);
	});

	await test.step("Generate and see the result", async () => {
		await page.getByRole("button", { name: "Generate Program" }).click();
		// Matches the success toast, e.g. 'Created "AI Generated Split" with 3 programs.'
		await expect(page.getByText(/^Created /)).toBeVisible({ timeout: 90_000 });
		await beat(page, 1800);
	});
});
