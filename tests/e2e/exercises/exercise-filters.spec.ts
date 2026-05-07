import { ROUTES } from "@/lib/consts";
import { expect, test } from "@/tests/e2e/fixtures";
import { signUpAndLoginTestUser } from "@/tests/e2e/helpers/auth";
import { createExercise } from "@/tests/e2e/helpers/entities";

test.describe("Exercise library filters", () => {
	test("Muscle filter can hide exercises and show empty state; All restores list", async ({
		page,
		request,
	}) => {
		const exerciseName = `Filter Chest Exercise ${Date.now()}`;

		await test.step("Create a chest-only exercise", async () => {
			await signUpAndLoginTestUser(page, request, "exercise-filters");
			await createExercise(page, exerciseName);
		});

		await test.step("Filter to a muscle group that excludes the exercise", async () => {
			await page.goto(ROUTES.EXERCISES);
			await page.getByRole("button", { name: /^quads$/i }).click();
			await expect(page.getByText("No exercises match your filters.")).toBeVisible();
		});

		await test.step("Select All muscles to show the exercise again", async () => {
			await page.getByRole("button", { name: "All" }).click();
			await expect(
				page.getByRole("button", { name: new RegExp(exerciseName, "i") }).first(),
			).toBeVisible();
		});
	});
});
