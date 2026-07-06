import { expect, type Locator, type Page } from "@playwright/test";

type DragToTargetOptions = {
	/** Milliseconds to hold before moving; dnd-kit needs a short press on the handle. */
	activationDelayMs?: number;
	/** Vertical offset from target center for the final drop position. */
	dropOffsetY?: number;
};

export async function dragToTarget(
	page: Page,
	source: Locator,
	target: Locator,
	options: DragToTargetOptions = {},
) {
	const { activationDelayMs = 250, dropOffsetY = 24 } = options;

	await source.scrollIntoViewIfNeeded();
	await target.scrollIntoViewIfNeeded();
	await expect(source).toBeVisible();
	await expect(target).toBeVisible();

	const sourceBox = await source.boundingBox();
	const targetBox = await target.boundingBox();

	if (!sourceBox || !targetBox) {
		throw new Error("Could not determine drag source/target positions.");
	}

	const sourceX = sourceBox.x + sourceBox.width / 2;
	const sourceY = sourceBox.y + sourceBox.height / 2;
	const targetX = targetBox.x + targetBox.width / 2;
	const targetY = targetBox.y + targetBox.height / 2;

	await page.mouse.move(sourceX, sourceY);
	await page.mouse.down();
	await page.waitForTimeout(activationDelayMs);
	await page.mouse.move(targetX, targetY, { steps: 25 });
	await page.mouse.move(targetX, targetY + dropOffsetY, { steps: 10 });
	await page.mouse.up();
	await page.waitForTimeout(200);
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
