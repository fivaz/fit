import { expect, test } from "@playwright/test";

import { ROUTES } from "@/lib/consts";
import { createExercise, signUpAndLoginTestUser } from "@/tests/e2e/helpers/flow-helpers";

test.describe("Exercises and body stats", () => {
	test("Authenticated user can create an exercise", async ({ page, request }) => {
		await signUpAndLoginTestUser(page, request, "exercises-stats-create");
		const exerciseName = `E2E Exercise ${Date.now()}`;
		await createExercise(page, exerciseName);

		await page.goto(ROUTES.EXERCISES);
		await page.getByRole("button", { name: "All" }).click();
		await page.getByPlaceholder("Search exercises...").fill(exerciseName);
		await expect(page.getByText(exerciseName).first()).toBeVisible();
	});

	test("Authenticated user can update body stats", async ({ page, request }) => {
		await signUpAndLoginTestUser(page, request, "exercises-stats-body");
		await page.goto(ROUTES.SETTINGS);
		await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

		const weight = "81.4";
		const bodyFat = "16.2";
		const muscleMass = "42.5";
		const visceralFat = "9";

		await page
			.locator("div")
			.filter({ hasText: /^Weight/ })
			.first()
			.click();
		await expect(page.getByRole("heading", { name: "Body Metrics" })).toBeVisible();

		await page.getByLabel("Weight (kg)").fill(weight);
		await page.getByLabel("Body Fat (%)").fill(bodyFat);
		await page.getByLabel("Muscle (%)").fill(muscleMass);
		await page.getByLabel("Visceral Fat").fill(visceralFat);
		await page.getByRole("button", { name: "Save Stats" }).click();

		await expect(page.getByText("Body metrics added successfully.")).toBeVisible();
		await expect(page.getByText(`${weight} kg`)).toBeVisible();
		await expect(page.getByText(`${bodyFat}%`)).toBeVisible();
		await expect(page.getByText(`${muscleMass}%`)).toBeVisible();
		await expect(page.getByText(`Lvl ${visceralFat}`)).toBeVisible();
	});
});
