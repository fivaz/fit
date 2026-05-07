import { ROUTES } from "@/lib/consts";
import { expect, test } from "@/tests/e2e/fixtures";
import { signUpAndLoginTestUser } from "@/tests/e2e/helpers/auth";

test.describe("Body Stats", () => {
	test("Authenticated user can update body stats", async ({ page, request }) => {
		await test.step("Authenticate and open settings", async () => {
			await signUpAndLoginTestUser(page, request, "body-stats");
			await page.goto(ROUTES.SETTINGS);
			await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
		});

		const weight = "81.4";
		const bodyFat = "16.2";
		const muscleMass = "42.5";
		const visceralFat = "9";

		await test.step("Update metrics in drawer", async () => {
			await page.getByRole("button", { name: "Edit Weight" }).click();
			await expect(page.getByRole("heading", { name: "Body Metrics" })).toBeVisible();

			await page.getByLabel("Weight (kg)").fill(weight);
			await page.getByLabel("Body Fat (%)").fill(bodyFat);
			await page.getByLabel("Muscle (%)").fill(muscleMass);
			await page.getByRole("spinbutton", { name: "Visceral Fat" }).fill(visceralFat);
			await page.getByRole("button", { name: "Save Stats" }).click();
		});

		await test.step("Verify metrics are displayed", async () => {
			await expect(page.getByText("Body metrics added successfully.")).toBeVisible();
			await expect(page.getByText(`${weight} kg`)).toBeVisible();
			await expect(page.getByText(`${bodyFat}%`)).toBeVisible();
			await expect(page.getByText(`${muscleMass}%`)).toBeVisible();
			await expect(page.getByText(`Lvl ${visceralFat}`)).toBeVisible();
		});
	});
});
