import { expect, test } from "@playwright/test";

import { ROUTES } from "@/lib/consts";
import {
	createExercise,
	createProgram,
	dragToTarget,
	ensureSharedTestUser,
	getSharedTestUser,
	loginWithEmailPassword,
} from "@/tests/e2e/helpers/flow-helpers";

test.describe.serial("Program associations and reordering", () => {
	const testUser = getSharedTestUser();

	test.beforeAll(async ({ request }) => {
		await ensureSharedTestUser(request, testUser);
	});

	test("Authenticated user can associate exercises with a program", async ({ page }) => {
		await loginWithEmailPassword(page, testUser);

		const exerciseOne = `Assoc Exercise A ${Date.now()}`;
		const exerciseTwo = `Assoc Exercise B ${Date.now()}`;
		const programName = `Assoc Program ${Date.now()}`;

		await createExercise(page, exerciseOne);
		await createExercise(page, exerciseTwo);
		await createProgram(page, programName);

		await page.getByRole("link", { name: `Open program ${programName}` }).click();
		await expect(page.getByRole("heading", { name: programName })).toBeVisible();

		await page.getByRole("button", { name: "Program actions" }).click();
		await page.getByRole("menuitem", { name: "Add Exercises" }).click();
		await expect(page.getByRole("heading", { name: "Add Exercises" })).toBeVisible();
		const addExercisesDialog = page.getByRole("dialog");

		await addExercisesDialog.getByRole("button", { name: "All" }).click();
		await addExercisesDialog.getByPlaceholder("Search exercises...").fill(exerciseOne);
		await addExercisesDialog.getByText(exerciseOne).first().click();
		await addExercisesDialog.getByPlaceholder("Search exercises...").fill(exerciseTwo);
		await addExercisesDialog.getByText(exerciseTwo).first().click();
		await addExercisesDialog.getByRole("button", { name: "Confirm (2) exercises" }).click();

		await expect(page.getByText("Exercises updated successfully.")).toBeVisible();
		await expect(page.getByText(exerciseOne).first()).toBeVisible();
		await expect(page.getByText(exerciseTwo).first()).toBeVisible();
	});

	test("Authenticated user can reorder programs", async ({ page }) => {
		await loginWithEmailPassword(page, testUser);

		const firstProgram = `Reorder Program A ${Date.now()}`;
		const secondProgram = `Reorder Program B ${Date.now()}`;

		await createProgram(page, firstProgram);
		await createProgram(page, secondProgram);
		await page.goto(ROUTES.PROGRAMS);

		const programLinks = page.getByRole("link", { name: /Open program / });
		const beforeOrder = await programLinks.evaluateAll((elements) =>
			elements.map((element) => element.getAttribute("aria-label") ?? ""),
		);
		const beforeFirstIndex = beforeOrder.findIndex((text) => text.includes(firstProgram));
		const beforeSecondIndex = beforeOrder.findIndex((text) => text.includes(secondProgram));

		expect(beforeFirstIndex).toBeGreaterThanOrEqual(0);
		expect(beforeSecondIndex).toBeGreaterThanOrEqual(0);
		expect(beforeFirstIndex).not.toBe(beforeSecondIndex);

		const firstProgramHandle = page
			.getByRole("link", { name: `Open program ${firstProgram}` })
			.getByRole("button", { name: "Drag to reorder" })
			.first();
		const secondProgramHandle = page
			.getByRole("link", { name: `Open program ${secondProgram}` })
			.getByRole("button", { name: "Drag to reorder" })
			.first();

		await dragToTarget(page, firstProgramHandle, secondProgramHandle);
		await page.reload();

		const afterOrder = await page
			.getByRole("link", { name: /Open program / })
			.evaluateAll((elements) =>
				elements.map((element) => element.getAttribute("aria-label") ?? ""),
			);
		const afterFirstIndex = afterOrder.findIndex((text) => text.includes(firstProgram));
		const afterSecondIndex = afterOrder.findIndex((text) => text.includes(secondProgram));

		expect(afterFirstIndex).toBeGreaterThanOrEqual(0);
		expect(afterSecondIndex).toBeGreaterThanOrEqual(0);
		expect(afterFirstIndex).not.toBe(afterSecondIndex);
		const beforeDirection = Math.sign(beforeFirstIndex - beforeSecondIndex);
		const afterDirection = Math.sign(afterFirstIndex - afterSecondIndex);
		expect(afterDirection).toBe(-beforeDirection);
	});
});
