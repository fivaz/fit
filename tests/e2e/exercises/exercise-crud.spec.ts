import { expect, test } from "@playwright/test";

import { ROUTES } from "@/lib/consts";
import { signUpAndLoginTestUser } from "@/tests/e2e/helpers/auth";
import { createExercise } from "@/tests/e2e/helpers/entities";

test.describe("Exercise CRUD", () => {
	test("Authenticated user can perform CRUD on an exercise", async ({ page, request }) => {
		await signUpAndLoginTestUser(page, request, "exercise-crud");
		const exerciseName = `E2E Exercise ${Date.now()}`;
		const updatedExerciseName = `${exerciseName} Updated`;

		await createExercise(page, exerciseName);

		await page.goto(ROUTES.EXERCISES);
		await page.getByRole("button", { name: "All" }).click();
		await page.getByPlaceholder("Search exercises...").fill(exerciseName);
		await expect(page.getByText(exerciseName).first()).toBeVisible();

		await page
			.getByRole("button", { name: new RegExp(exerciseName, "i") })
			.first()
			.click();
		await expect(page.getByRole("heading", { name: "Edit Exercise" })).toBeVisible();
		await page.getByLabel("Exercise Name").fill(updatedExerciseName);
		await page.getByRole("button", { name: "Save Changes" }).click();
		await expect(page.getByText("Exercise updated successfully.")).toBeVisible();

		await page.goto(ROUTES.EXERCISES);
		await page.getByRole("button", { name: "All" }).click();
		await page.getByPlaceholder("Search exercises...").fill(updatedExerciseName);
		await expect(page.getByText(updatedExerciseName).first()).toBeVisible();

		await page
			.getByRole("button", { name: new RegExp(updatedExerciseName, "i") })
			.first()
			.click();
		await expect(page.getByRole("heading", { name: "Edit Exercise" })).toBeVisible();
		await page.getByRole("button", { name: "Delete exercise" }).click();
		await page.getByRole("button", { name: "Confirm" }).click();
		await expect(page.getByText("Exercise deleted successfully.")).toBeVisible();

		await page.goto(ROUTES.EXERCISES);
		await page.getByRole("button", { name: "All" }).click();
		await page.getByPlaceholder("Search exercises...").fill(updatedExerciseName);
		await expect(page.getByText(updatedExerciseName).first()).toHaveCount(0);
	});
});
