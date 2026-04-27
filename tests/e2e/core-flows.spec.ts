import { expect, type Page, test } from "@playwright/test";

import { ROUTES } from "@/lib/consts";

import "dotenv/config";

type TestUser = {
	email: string;
	password: string;
	name: string;
};

const AUTH_API_ROUTES = {
	// Better Auth entrypoint mounted by Next route handler.
	authEmailSignUpApi: /\/api\/auth\/sign-up\/email$/,
	authEmailSignInApi: /\/api\/auth\/sign-in\/email$/,
} as const;

// Generated once per run so you can reuse this account manually afterward.
const generatedCredential = `test-${Date.now()}@example.com`;

const testUser: TestUser = {
	email: generatedCredential,
	password: generatedCredential,
	name: "Playwright E2E",
};

async function loginWithEmailPassword(page: Page, user: TestUser) {
	await page.goto(ROUTES.LOGIN);
	await page.getByLabel("Email").fill(user.email);
	await page.getByLabel("Password").fill(user.password);

	const signInResponsePromise = page.waitForResponse((response) => {
		return (
			AUTH_API_ROUTES.authEmailSignInApi.test(response.url()) &&
			response.request().method() === "POST"
		);
	});

	await page.getByRole("button", { name: "Login" }).click();

	const signInResponse = await signInResponsePromise;
	expect(signInResponse.ok()).toBeTruthy();

	await expect(page).toHaveURL(/\/$|\/workout\/.*/);
}

test.describe.serial("Core flows", () => {
	test.beforeAll(async ({ request }) => {
		console.log(`[E2E USER] email=${testUser.email}`);

		const signupResponse = await request.post("/api/auth/sign-up/email", {
			data: {
				email: testUser.email,
				password: testUser.password,
				name: testUser.name,
				callbackURL: ROUTES.HOME,
			},
		});

		expect(signupResponse.ok()).toBeTruthy();
	});

	test("Email/Password login redirects to dashboard", async ({ page }) => {
		await loginWithEmailPassword(page, testUser);
		await expect(page).toHaveURL(/^(?!.*\/login$).*/);
		await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
	});

	test("Authenticated user can create a workout program", async ({ page }) => {
		await loginWithEmailPassword(page, testUser);

		await page.goto(ROUTES.PROGRAMS);
		await expect(page.getByRole("heading", { name: "Programs" })).toBeVisible();

		const programName = `E2E Program ${Date.now()}`;

		await page.getByRole("button", { name: "Create program" }).click();
		await expect(page.getByRole("heading", { name: "Create Program" })).toBeVisible();

		await page.getByLabel("Program Name").fill(programName);
		await page.getByRole("button", { name: /chest/i }).click();
		await page.getByRole("button", { name: "Create Program" }).click();

		await expect(page.getByText("Program created successfully.")).toBeVisible();
		await expect(page.getByText(programName).first()).toBeVisible();
	});

	test("Authenticated user can create an exercise", async ({ page }) => {
		await loginWithEmailPassword(page, testUser);

		await page.goto(ROUTES.EXERCISES);
		await expect(page.getByRole("heading", { name: "Exercises" })).toBeVisible();

		const exerciseName = `E2E Exercise ${Date.now()}`;

		await page.getByRole("button", { name: "Create exercise" }).click();
		await expect(page.getByRole("heading", { name: "Create Exercise" })).toBeVisible();

		await page.getByLabel("Exercise Name").fill(exerciseName);
		await page.getByRole("button", { name: /chest/i }).click();
		await page.getByRole("button", { name: "Create Exercise" }).click();

		await expect(page.getByText("Exercise created successfully.")).toBeVisible();
		await page.goto(ROUTES.EXERCISES);
		await page.getByRole("button", { name: "All" }).click();
		await page.getByPlaceholder("Search exercises...").fill(exerciseName);
		await expect(page.getByText(exerciseName).first()).toBeVisible();
	});

	test("Authenticated user can update body stats", async ({ page }) => {
		await loginWithEmailPassword(page, testUser);

		await page.goto(ROUTES.SETTINGS);
		await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

		const weight = "81.4";
		const bodyFat = "16.2";
		const muscleMass = "42.5";
		const visceralFat = "9";

		await page
			.locator("div")
			.filter({ hasText: /^Weight/ })
			.first()
			.click();
		await expect(page.getByRole("heading", { name: "Body Metrics" })).toBeVisible();

		await page.getByLabel("Weight (kg)").fill(weight);
		await page.getByLabel("Body Fat (%)").fill(bodyFat);
		await page.getByLabel("Muscle (%)").fill(muscleMass);
		await page.getByLabel("Visceral Fat").fill(visceralFat);
		await page.getByRole("button", { name: "Save Stats" }).click();

		await expect(page.getByText("Body metrics added successfully.")).toBeVisible();
		await expect(page.getByText(`${weight} kg`)).toBeVisible();
		await expect(page.getByText(`${bodyFat}%`)).toBeVisible();
		await expect(page.getByText(`${muscleMass}%`)).toBeVisible();
		await expect(page.getByText(`Lvl ${visceralFat}`)).toBeVisible();
	});
});
