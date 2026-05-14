import { ROUTES } from "@/lib/consts";
import { expect, test } from "@/tests/e2e/fixtures";
import { signUpAndLoginTestUser } from "@/tests/e2e/helpers/auth";

test.describe("Bottom navigation", () => {
	test("Authenticated user can reach main tabs from the bottom nav", async ({ page, request }) => {
		await signUpAndLoginTestUser(page, request, "bottom-nav");

		await test.step("Home", async () => {
			await page.getByRole("link", { name: "Home" }).click();
			await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
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
	test("Invalid program and workout ids show not-found UI when authenticated", async ({
		page,
		request,
	}) => {
		await signUpAndLoginTestUser(page, request, "not-found-routes");

		await test.step("Unknown program", async () => {
			await page.goto(`${ROUTES.PROGRAMS}/program-id-that-does-not-exist-0000`);
			await expect(page).toHaveURL(/\/programs\/program-id-that-does-not-exist-0000$/);
			await expect(page.getByText("Program not found")).toBeVisible();
			await expect(page.getByRole("button", { name: "Go Back" })).toBeVisible();
		});

		await test.step("Unknown workout", async () => {
			await page.goto(`${ROUTES.WORKOUT}/workout-id-that-does-not-exist-0000`);
			await expect(page.getByText("Workout not found")).toBeVisible();
			await expect(page.getByRole("button", { name: "Go Back" })).toBeVisible();
		});
	});
});
