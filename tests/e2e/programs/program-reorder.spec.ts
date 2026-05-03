import { ROUTES } from "@/lib/consts";
import { expect, test } from "@/tests/e2e/fixtures";
import { signUpAndLoginTestUser } from "@/tests/e2e/helpers/auth";
import { dragToTarget, waitForLabeledItem } from "@/tests/e2e/helpers/dnd";
import { createProgram } from "@/tests/e2e/helpers/entities";

test.describe("Program Reorder", () => {
	test("Authenticated user can reorder programs", async ({ page, request }) => {
		await test.step("Authenticate user", async () => {
			await signUpAndLoginTestUser(page, request, "program-reorder");
		});

		const firstProgram = `Reorder Program A ${Date.now()}`;
		const secondProgram = `Reorder Program B ${Date.now()}`;

		await test.step("Create programs and open listing", async () => {
			await createProgram(page, firstProgram);
			await createProgram(page, secondProgram);
			await page.goto(ROUTES.PROGRAMS);
			await waitForLabeledItem(page, "link", /Open program /, firstProgram);
			await waitForLabeledItem(page, "link", /Open program /, secondProgram);
		});

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

		await test.step("Reorder programs and verify persisted order", async () => {
			await dragToTarget(page, firstProgramHandle, secondProgramHandle);
			await expect(page.getByRole("button", { name: "Create program" })).toBeEnabled({
				timeout: 15_000,
			});
			await page.reload();
			await waitForLabeledItem(page, "link", /Open program /, firstProgram);
			await waitForLabeledItem(page, "link", /Open program /, secondProgram);
		});

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
