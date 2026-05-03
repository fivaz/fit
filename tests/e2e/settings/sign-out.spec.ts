import { ROUTES } from "@/lib/consts";
import { expect, test } from "@/tests/e2e/fixtures";
import { signUpAndLoginTestUser } from "@/tests/e2e/helpers/auth";

test.describe("Sign out", () => {
	test("Authenticated user can sign out from Settings and reach login", async ({
		page,
		request,
	}) => {
		await test.step("Authenticate", async () => {
			await signUpAndLoginTestUser(page, request, "settings-sign-out");
		});

		await test.step("Open Settings and sign out", async () => {
			await page.goto(ROUTES.SETTINGS);
			await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
			await page.getByRole("button", { name: "Sign Out" }).click();
		});

		await test.step("Verify login route", async () => {
			await expect(page).toHaveURL(new RegExp(`${ROUTES.LOGIN.replace("/", "\\/")}$`));
			await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
		});
	});
});
