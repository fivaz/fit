import { expect, test } from "@/tests/e2e/fixtures";
import { signUpAndLoginTestUser } from "@/tests/e2e/helpers/auth";
import { dragToTarget, waitForLabeledItem } from "@/tests/e2e/helpers/dnd";
import { createExercise, createProgram } from "@/tests/e2e/helpers/entities";

test.describe("Program Exercise Reorder", () => {
	test("Authenticated user can reorder exercises within a program", async ({ page, request }) => {
		await test.step("Authenticate user", async () => {
			await signUpAndLoginTestUser(page, request, "program-exercise-reorder");
		});

		const exerciseOne = `Reorder Exercise A ${Date.now()}`;
		const exerciseTwo = `Reorder Exercise B ${Date.now()}`;
		const programName = `Reorder Exercise Program ${Date.now()}`;

		await test.step("Create data and open program", async () => {
			await createExercise(page, exerciseOne);
			await createExercise(page, exerciseTwo);
			await createProgram(page, programName);
			await page.getByRole("button", { name: `Open program ${programName}` }).click();
		});

		await test.step("Associate both exercises", async () => {
			await page.getByRole("button", { name: "Program actions" }).click();
			await page.getByRole("menuitem", { name: "Add Exercises" }).click();
			const addExercisesDialog = page.getByRole("dialog");
			await addExercisesDialog.getByRole("button", { name: "All" }).click();
			await addExercisesDialog
				.getByRole("textbox", { name: "Search exercises..." })
				.fill(exerciseOne);
			await addExercisesDialog.getByText(exerciseOne).first().click();
			await addExercisesDialog
				.getByRole("textbox", { name: "Search exercises..." })
				.fill(exerciseTwo);
			await addExercisesDialog.getByText(exerciseTwo).first().click();
			await addExercisesDialog.getByRole("button", { name: "Confirm (2) exercises" }).click();
			await expect(page.getByText("Exercises updated successfully.")).toBeVisible();
			await waitForLabeledItem(page, "button", /Open exercise /, exerciseOne);
			await waitForLabeledItem(page, "button", /Open exercise /, exerciseTwo);
		});

		const exerciseOpenButtons = page.getByRole("button", { name: /Open exercise / });
		const beforeOrder = await exerciseOpenButtons.evaluateAll((elements) =>
			elements.map((element) => element.getAttribute("aria-label") ?? ""),
		);
		const beforeFirstIndex = beforeOrder.findIndex((text) => text.includes(exerciseOne));
		const beforeSecondIndex = beforeOrder.findIndex((text) => text.includes(exerciseTwo));

		expect(beforeFirstIndex).toBeGreaterThanOrEqual(0);
		expect(beforeSecondIndex).toBeGreaterThanOrEqual(0);

		const dragHandles = page.getByRole("button", { name: "Drag exercise to reorder" });
		const firstExerciseHandle = dragHandles.nth(beforeFirstIndex);
		const secondExerciseHandle = dragHandles.nth(beforeSecondIndex);

		await test.step("Reorder and verify persistence", async () => {
			const reorderResponse = page.waitForResponse(
				(response) =>
					response.url().includes("/api/programs/") &&
					response.url().endsWith("/exercises/reorder") &&
					response.request().method() === "PATCH" &&
					response.ok(),
				{ timeout: 12_000 },
			);

			await dragToTarget(page, firstExerciseHandle, secondExerciseHandle);
			await reorderResponse;
			await expect(page.getByRole("button", { name: "Program actions" })).toBeVisible({
				timeout: 15_000,
			});
			await page.reload();
			await waitForLabeledItem(page, "button", /Open exercise /, exerciseOne);
			await waitForLabeledItem(page, "button", /Open exercise /, exerciseTwo);
		});

		const afterOrder = await page
			.getByRole("button", { name: /Open exercise / })
			.evaluateAll((elements) =>
				elements.map((element) => element.getAttribute("aria-label") ?? ""),
			);
		const afterFirstIndex = afterOrder.findIndex((text) => text.includes(exerciseOne));
		const afterSecondIndex = afterOrder.findIndex((text) => text.includes(exerciseTwo));

		expect(afterFirstIndex).toBeGreaterThanOrEqual(0);
		expect(afterSecondIndex).toBeGreaterThanOrEqual(0);
		expect(afterFirstIndex).toBeGreaterThan(beforeFirstIndex);
		expect(afterSecondIndex).toBeLessThan(beforeSecondIndex);
	});
});
