import { expect, type Page } from "@playwright/test";

/** Asserts the dashboard home view (welcome hero), not an in-progress workout. */
export async function expectHomePageVisible(page: Page) {
	await expect(page.getByText("Welcome back,")).toBeVisible();
}
