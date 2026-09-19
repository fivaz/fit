import type { Page } from "@playwright/test";

import { ROUTES } from "@/lib/consts";
import { expect, test } from "@/tests/e2e/fixtures";
import { signUpAndLoginTestUser } from "@/tests/e2e/helpers/auth";

function toast(page: Page, text: string) {
	return page.getByRole("region", { name: /Notifications/ }).getByText(text);
}

async function createProgramGroup(page: Page, name: string) {
	const initialGroupsLoaded = page.waitForResponse(
		(response) =>
			response.url().includes("/api/program-groups") && response.request().method() === "GET",
	);
	await page.goto(ROUTES.PROGRAMS);
	await initialGroupsLoaded;
	await page.getByRole("button", { name: "Create program group" }).click();
	await expect(page.getByRole("heading", { name: "Create Group" })).toBeVisible();
	await page.getByLabel("Group Name").fill(name);
	await page.getByRole("button", { name: "Create Group" }).click();
	await expect(toast(page, "Group created successfully.")).toBeVisible({ timeout: 15_000 });
}

test.describe("Program Group Delete", () => {
	test("Authenticated user can delete a group together with its programs", async ({
		page,
		request,
	}, testInfo) => {
		await test.step("Authenticate user", async () => {
			await signUpAndLoginTestUser(page, request, "program-group-delete");
		});

		const groupName = `Delete Group - ${testInfo.testId}`;
		const programName = `Grouped Program - ${testInfo.testId}`;
		const unrelatedProgramName = `Ungrouped Program - ${testInfo.testId}`;
		const unrelatedProgramButton = () =>
			page.getByRole("button", { name: new RegExp(`Open program.*${unrelatedProgramName}`) });

		await test.step("Create a group", async () => {
			await createProgramGroup(page, groupName);
			await expect(page.getByRole("button", { name: `Hide ${groupName} group` })).toBeVisible();
		});

		async function createProgramInGroup(name: string, group?: string) {
			await page.getByRole("button", { name: "Create program", exact: true }).click();
			const dialog = page.getByRole("dialog");
			await expect(dialog.getByRole("heading", { name: "Create Program" })).toBeVisible();
			await dialog.getByRole("button", { name: "Switch to manual program creation" }).click();
			await dialog.getByLabel("Program Name").fill(name);
			await dialog.getByRole("button", { name: /chest/i }).click();
			if (group) {
				await dialog.getByLabel("Group", { exact: true }).selectOption({ label: group });
			}
			await dialog.getByRole("button", { name: "Create Program" }).click();
			await expect(toast(page, "Program created successfully.")).toBeVisible({ timeout: 15_000 });
		}

		await test.step("Create a program inside the group and one outside it", async () => {
			await createProgramInGroup(programName, groupName);
			await expect(toast(page, "Program created successfully.")).toBeHidden({ timeout: 15_000 });
			await createProgramInGroup(unrelatedProgramName);
		});

		await test.step("Delete the group and confirm", async () => {
			await page.getByRole("button", { name: `Delete ${groupName} group` }).click();
			await expect(page.getByRole("heading", { name: "Delete Group" })).toBeVisible();
			await page.getByRole("button", { name: "Confirm" }).click();
			await expect(toast(page, "Group deleted successfully.")).toBeVisible({ timeout: 15_000 });
		});

		await test.step("Verify group and its program are gone", async () => {
			await expect(page.getByRole("button", { name: `Hide ${groupName} group` })).not.toBeVisible();
			await expect(page.getByRole("button", { name: `Show ${groupName} group` })).not.toBeVisible();

			const programButton = page.getByRole("button", {
				name: new RegExp(`Open program.*${programName}`),
			});
			await expect(programButton).toHaveCount(0);
			await expect(unrelatedProgramButton()).toBeVisible();

			await page.reload();
			await expect(unrelatedProgramButton()).toBeVisible();
			await expect(programButton).toHaveCount(0);
			await expect(page.getByRole("button", { name: `Hide ${groupName} group` })).not.toBeVisible();
		});
	});
});
