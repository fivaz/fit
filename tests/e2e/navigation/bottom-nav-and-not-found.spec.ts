import { programsDetailHref } from "@/lib/programs/navigation";
import { expect, test } from "@/tests/e2e/fixtures";
import { signUpAndLoginTestUser } from "@/tests/e2e/helpers/auth";
import { expectHomePageVisible } from "@/tests/e2e/helpers/home";

test.describe("Bottom navigation", () => {
	test("Authenticated user can reach main tabs from the bottom nav", async ({ page, request }) => {
		await signUpAndLoginTestUser(page, request, "bottom-nav");

		await test.step("Home", async () => {
			await page.getByRole("link", { name: "Home" }).click();
			await expectHomePageVisible(page);
			await expect(page.getByRole("link", { name: "Home" })).toHaveAttribute(
				"aria-current",
				"page",
			);
		});

		await test.step("Programs", async () => {
			await page.getByRole("link", { name: "Programs" }).click();
			await expect(page.getByRole("heading", { name: "Programs" })).toBeVisible();
			await expect(page.getByRole("link", { name: "Programs" })).toHaveAttribute(
				"aria-current",
				"page",
			);
		});

		await test.step("Exercises", async () => {
			await page.getByRole("link", { name: "Exercises" }).click();
			await expect(page.getByRole("heading", { name: "Exercises" })).toBeVisible();
			await expect(page.getByRole("link", { name: "Exercises" })).toHaveAttribute(
				"aria-current",
				"page",
			);
		});

		await test.step("Progress", async () => {
			await page.getByRole("link", { name: "Progress" }).click();
			await expect(page.getByRole("heading", { name: "Progress" })).toBeVisible();
			await expect(page.getByRole("link", { name: "Progress" })).toHaveAttribute(
				"aria-current",
				"page",
			);
		});

		await test.step("Settings", async () => {
			await page.getByRole("link", { name: "Settings" }).click();
			await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
			await expect(page.getByRole("link", { name: "Settings" })).toHaveAttribute(
				"aria-current",
				"page",
			);
		});
	});
});

test.describe("Not found routes", () => {
	test("Invalid program id shows not-found UI when authenticated", async ({ page, request }) => {
		await signUpAndLoginTestUser(page, request, "not-found-routes");

		const invalidProgramHref = programsDetailHref("program-id-that-does-not-exist-0000");
		await page.goto(invalidProgramHref);
		await expect(page).toHaveURL(invalidProgramHref);
		await expect(page.getByText("Program not found")).toBeVisible();
		await expect(page.getByRole("button", { name: "Go Back" })).toBeVisible();
	});
});
