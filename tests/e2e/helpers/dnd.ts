import { expect, type Locator, type Page } from "@playwright/test";

export async function dragToTarget(page: Page, source: Locator, target: Locator) {
	await source.scrollIntoViewIfNeeded();
	await target.scrollIntoViewIfNeeded();
	await expect(source).toBeVisible();
	await expect(target).toBeVisible();

	const sourceBox = await source.boundingBox();
	const targetBox = await target.boundingBox();

	if (!sourceBox || !targetBox) {
		throw new Error("Could not determine drag source/target positions.");
	}

	await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
	await page.mouse.down();
	await page.waitForTimeout(120);
	await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, {
		steps: 20,
	});
	await page.mouse.move(
		targetBox.x + targetBox.width / 2,
		targetBox.y + targetBox.height / 2 + 24,
		{
			steps: 10,
		},
	);
	await page.mouse.up();
	await page.waitForTimeout(150);
}

export async function waitForLabeledItem(
	page: Page,
	role: "link" | "button",
	namePattern: RegExp,
	expectedSubstring: string,
) {
	await expect
		.poll(
			async () => {
				return page
					.getByRole(role, { name: namePattern })
					.evaluateAll((elements) =>
						elements.map((element) => element.getAttribute("aria-label") ?? ""),
					);
			},
			{ timeout: 15_000 },
		)
		.toContainEqual(expect.stringContaining(expectedSubstring));
}
