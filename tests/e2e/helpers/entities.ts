import { expect, type Page } from "@playwright/test";

import { ROUTES } from "@/lib/consts";

export async function createProgram(page: Page, name: string) {
	await page.goto(ROUTES.PROGRAMS);
	await page.getByRole("button", { name: "Create program", exact: true }).click();
	await expect(page.getByRole("heading", { name: "Create Program" })).toBeVisible();
	await page.getByRole("button", { name: "Switch to manual program creation" }).click();
	await page.getByLabel("Program Name").fill(name);
	await page.getByRole("button", { name: /chest/i }).click();
	await page.getByRole("button", { name: "Create Program" }).click();
	await expect(page.getByText("Program created successfully.")).toBeVisible();
}

export async function createExercise(page: Page, name: string) {
	await page.goto(ROUTES.EXERCISES);
	await page.getByRole("button", { name: "Create exercise" }).click();
	await expect(page.getByRole("heading", { name: "Create Exercise" })).toBeVisible();
	await page.getByLabel("Exercise Name").fill(name);
	await page.getByRole("button", { name: /chest/i }).click();
	await page.getByRole("button", { name: "Create Exercise" }).click();
	await expect(page.getByText("Exercise created successfully.")).toBeVisible();
}
