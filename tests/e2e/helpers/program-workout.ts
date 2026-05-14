import { expect, type Page, type Response } from "@playwright/test";

export async function openProgramFromList(page: Page, programName: string) {
	await page.getByRole("button", { name: `Open program ${programName}` }).click();
	await expect(page.getByRole("heading", { name: programName })).toBeVisible();
}

/**
 * From program list: open program, add exercises via dialog, wait for success toast.
 */
export async function associateExercisesWithProgram(
	page: Page,
	programName: string,
	exerciseNames: string[],
) {
	await openProgramFromList(page, programName);

	await page.getByRole("button", { name: "Program actions" }).click();
	await page.getByRole("menuitem", { name: "Add Exercises" }).click();
	const dialog = page.getByRole("dialog");
	await dialog.getByRole("button", { name: "All" }).click();
	for (const name of exerciseNames) {
		await dialog.getByRole("textbox", { name: "Search exercises..." }).fill(name);
		await dialog.getByText(name).first().click();
	}
	await dialog.getByRole("button", { name: `Confirm (${exerciseNames.length}) exercises` }).click();
	await expect(page.getByText("Exercises updated successfully.")).toBeVisible();
}

export async function startWorkoutFromProgramPage(page: Page, programName: string) {
	await page.getByRole("button", { name: "Start Workout" }).click();
	await expect(page).toHaveURL(/\/workout\/.+/);
	await expect(page.getByRole("heading", { name: programName })).toBeVisible();
}

/**
 * Wait for the debounced workout set sync request and the settled header state.
 */
export async function waitForWorkoutSynced(page: Page) {
	await page.waitForResponse(isWorkoutSetSyncResponse, { timeout: 12_000 });
	await expect(page.getByLabel("synced-icon")).toBeVisible({ timeout: 12_000 });
}

function isWorkoutSetSyncResponse(response: Response) {
	return (
		response.url().includes("/api/workouts/") &&
		response.url().endsWith("/sets") &&
		response.request().method() === "PUT" &&
		response.ok()
	);
}
