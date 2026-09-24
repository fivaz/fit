import { ROUTES } from "@/lib/consts";

import { expect, test } from "./support/fixtures";
import { beat, HOLD, settle, typeSlowly } from "./support/pacing";

// Records the real feature. Opt-in because it calls OpenAI and spends one of the demo account's
// credits. The wait for OpenAI is cut out during conversion (see the timeline marks below), keeping
// a couple of seconds of the "Generating..." state so the jump is understandable.
test("ai-coach", async ({ page, timeline }) => {
	test.skip(!process.env.DEMO_AI, "Set DEMO_AI=1 to record the AI coach clip.");
	test.skip(!process.env.OPENAI_API_KEY, "OPENAI_API_KEY is not set.");

	await test.step("Open the programs list", async () => {
		await page.goto(ROUTES.PROGRAMS);
		await expect(page.getByRole("heading", { name: "Programs" })).toBeVisible();
		await settle(page);
		await beat(page, HOLD.read);
	});

	await test.step("Open Create Program in AI coach mode", async () => {
		await page.getByRole("button", { name: "Create program", exact: true }).click();
		await expect(page.getByRole("heading", { name: "Create Program" })).toBeVisible();
		await beat(page, HOLD.read);
	});

	await test.step("Describe the workout", async () => {
		await typeSlowly(
			page.getByLabel("Workout description"),
			"A 4-day upper/lower split to build muscle, 45-minute sessions, full gym.",
			70,
		);
		await beat(page, HOLD.read);
	});

	await test.step("Generate, cutting the wait for OpenAI", async () => {
		await page.getByRole("button", { name: "Generate Program" }).click();
		const loadingShownFor = 2.5;
		const cutFrom = timeline.now() + loadingShownFor;

		// Matches the success toast, e.g. 'Created "AI Generated Split" with 4 programs.'
		await expect(page.getByText(/^Created /)).toBeVisible({ timeout: 90_000 });
		timeline.cut(cutFrom, timeline.now() - 0.3);
		await beat(page, HOLD.read);
	});

	await test.step("Show the generated programs", async () => {
		await beat(page, HOLD.linger);
	});
});
