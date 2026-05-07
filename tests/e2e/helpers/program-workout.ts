import { expect, type Page } from "@playwright/test";

/**
 * From program list: open program, add exercises via dialog, wait for success toast.
 */
export async function associateExercisesWithProgram(
	page: Page,
	programName: string,
	exerciseNames: string[],
) {
	await page.getByRole("link", { name: `Open program ${programName}` }).click();
	await expect(page.getByRole("heading", { name: programName })).toBeVisible();

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
 * Wait for debounced workout set sync (orange upload → green check in header).
 */
export async function waitForWorkoutSynced(page: Page) {
	await page.waitForTimeout(1900);
	await expect(page.getByLabel("syncing-icon")).toBeVisible({ timeout: 8000 });
	await expect(page.getByLabel("synced-icon")).toBeVisible({ timeout: 12_000 });
}
