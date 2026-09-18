import { ROUTES } from "@/lib/consts";
import { expect, test } from "@/tests/e2e/fixtures";
import { signUpAndLoginTestUser } from "@/tests/e2e/helpers/auth";

async function createProgramGroup(page: import("@playwright/test").Page, name: string) {
	await page.goto(ROUTES.PROGRAMS);
	await page.getByRole("button", { name: "Create program group" }).click();
	await expect(page.getByRole("heading", { name: "Create Group" })).toBeVisible();
	await page.getByLabel("Group Name").fill(name);
	await page.getByRole("button", { name: "Create Group" }).click();
	await expect(page.getByText("Group created successfully.")).toBeVisible();
}

test.describe("Program Group Delete", () => {
	test("Authenticated user can delete a group and its programs move to Ungrouped", async ({
		page,
		request,
	}, testInfo) => {
		await test.step("Authenticate user", async () => {
			await signUpAndLoginTestUser(page, request, "program-group-delete");
		});

		const groupName = `Delete Group - ${testInfo.testId}`;
		const programName = `Grouped Program - ${testInfo.testId}`;

		await test.step("Create a group", async () => {
			await createProgramGroup(page, groupName);
			await expect(page.getByRole("button", { name: `Hide ${groupName} group` })).toBeVisible();
		});

		await test.step("Create a program inside the group", async () => {
			await page.getByRole("button", { name: "Create program", exact: true }).click();
			await expect(page.getByRole("heading", { name: "Create Program" })).toBeVisible();
			await page.getByRole("button", { name: "Switch to manual program creation" }).click();
			await page.getByLabel("Program Name").fill(programName);
			await page.getByRole("button", { name: /chest/i }).click();
			await page.getByLabel("Group").selectOption({ label: groupName });
			await page.getByRole("button", { name: "Create Program" }).click();
			await expect(page.getByText("Program created successfully.")).toBeVisible();
		});

		await test.step("Delete the group and confirm", async () => {
			await page.getByRole("button", { name: `Delete ${groupName} group` }).click();
			await expect(page.getByRole("heading", { name: "Delete Group" })).toBeVisible();
			await page.getByRole("button", { name: "Confirm" }).click();
			await expect(page.getByText("Group deleted successfully.")).toBeVisible();
		});

		await test.step("Verify group is gone and program moved to Ungrouped", async () => {
			await expect(page.getByRole("button", { name: `Hide ${groupName} group` })).not.toBeVisible();
			await expect(page.getByRole("button", { name: `Show ${groupName} group` })).not.toBeVisible();

			await expect(page.getByText("Ungrouped")).toBeVisible();
			await expect(
				page.getByRole("button", { name: new RegExp(`Open program.*${programName}`) }),
			).toBeVisible();

			await page.reload();
			await expect(
				page.getByRole("button", { name: new RegExp(`Open program.*${programName}`) }),
			).toBeVisible();
			await expect(page.getByRole("button", { name: `Hide ${groupName} group` })).not.toBeVisible();
		});
	});
});
