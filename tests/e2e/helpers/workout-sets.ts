import { expect, type Page } from "@playwright/test";

type WorkoutSetValues = {
	reps: string;
	weight: string;
	time: string;
};

export async function fillWorkoutSet(page: Page, setIndex: number, values: WorkoutSetValues) {
	const repsInput = page.getByRole("spinbutton").nth(setIndex * 2);
	const weightInput = page.getByRole("spinbutton").nth(setIndex * 2 + 1);
	const timeButton = page.getByRole("button", { name: "Set time" }).nth(setIndex);

	await repsInput.fill(values.reps);
	await weightInput.fill(values.weight);
	await setSetTimeManually(page, setIndex, values.time);

	await expect(repsInput).toHaveValue(values.reps);
	await expect(weightInput).toHaveValue(values.weight);
	await expect(timeButton).toHaveText(values.time);
}

export async function setSetTimeManually(page: Page, setIndex: number, time: string) {
	if (setIndex > 0) {
		await page.getByRole("heading", { level: 1 }).first().click();
	}

	const timeButton = page.getByRole("button", { name: "Set time" }).nth(setIndex);
	const timeButtonBox = await timeButton.boundingBox();
	if (!timeButtonBox) throw new Error(`Unable to locate set time button at index ${setIndex}.`);

	await page.mouse.move(
		timeButtonBox.x + timeButtonBox.width / 2,
		timeButtonBox.y + timeButtonBox.height / 2,
	);
	await page.mouse.down();
	await page.waitForTimeout(650);
	await page.mouse.up();

	const timeInput = page.getByLabel("Set time input").first();
	await expect(timeInput).toBeVisible();
	await timeInput.fill(time);
	await timeInput.blur();
}
