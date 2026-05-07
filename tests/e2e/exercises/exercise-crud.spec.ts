import { ROUTES } from "@/lib/consts";
import { expect, test } from "@/tests/e2e/fixtures";
import { signUpAndLoginTestUser } from "@/tests/e2e/helpers/auth";
import { createExercise } from "@/tests/e2e/helpers/entities";

test.describe("Exercise CRUD", () => {
	test("Authenticated user can perform CRUD on an exercise", async ({ page, request }) => {
		await test.step("Authenticate user", async () => {
			await signUpAndLoginTestUser(page, request, "exercise-crud");
		});
		const exerciseName = `E2E Exercise ${Date.now()}`;
		const updatedExerciseName = `${exerciseName} Updated`;

		await test.step("Create exercise", async () => {
			await createExercise(page, exerciseName);
		});

		await test.step("Read created exercise from library", async () => {
			await page.goto(ROUTES.EXERCISES);
			await page.getByRole("button", { name: "All" }).click();
			await page.getByRole("textbox", { name: "Search exercises..." }).fill(exerciseName);
			await expect(
				page.getByRole("button", { name: new RegExp(exerciseName, "i") }).first(),
			).toBeVisible();
		});

		await test.step("Update exercise", async () => {
			await page
				.getByRole("button", { name: new RegExp(exerciseName, "i") })
				.first()
				.click();
			await expect(page.getByRole("heading", { name: "Edit Exercise" })).toBeVisible();
			await page.getByLabel("Exercise Name").fill(updatedExerciseName);

			const updateResponse = page.waitForResponse(
				(response) =>
					response.url().endsWith("/api/exercises") &&
					response.request().method() === "POST" &&
					response.ok(),
				{ timeout: 12_000 },
			);
			await page.getByLabel("Exercise Name").press("Enter");
			await updateResponse;
			await expect(page.getByText("Exercise updated successfully.")).toBeVisible();
		});

		await test.step("Read updated exercise from library", async () => {
			await page.goto(ROUTES.EXERCISES);
			await page.getByRole("button", { name: "All" }).click();
			await page.getByRole("textbox", { name: "Search exercises..." }).fill(updatedExerciseName);
			await expect(
				page.getByRole("button", { name: new RegExp(updatedExerciseName, "i") }).first(),
			).toBeVisible();
		});

		await test.step("Delete exercise", async () => {
			await page
				.getByRole("button", { name: new RegExp(updatedExerciseName, "i") })
				.first()
				.click();
			await expect(page.getByRole("heading", { name: "Edit Exercise" })).toBeVisible();
			await page.getByRole("button", { name: "Delete exercise" }).click();
			await page.getByRole("button", { name: "Confirm" }).click();
			await expect(page.getByText("Exercise deleted successfully.")).toBeVisible();
		});

		await test.step("Verify exercise is absent after delete", async () => {
			await page.goto(ROUTES.EXERCISES);
			await page.getByRole("button", { name: "All" }).click();
			await page.getByRole("textbox", { name: "Search exercises..." }).fill(updatedExerciseName);
			await expect(
				page.getByRole("button", { name: new RegExp(updatedExerciseName, "i") }),
			).toHaveCount(0);
		});
	});
});
