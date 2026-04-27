import { expect, type Page, test } from "@playwright/test";

import "dotenv/config";

type TestUser = {
	email: string;
	password: string;
	name: string;
};

const ROUTES = {
	login: "/login",
	dashboard: "/",
	programs: "/programs",
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
	await page.goto(ROUTES.login);
	await page.getByLabel("Email").fill(user.email);
	await page.getByLabel("Password").fill(user.password);

	const signInResponsePromise = page.waitForResponse((response) => {
		return ROUTES.authEmailSignInApi.test(response.url()) && response.request().method() === "POST";
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
				callbackURL: ROUTES.dashboard,
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

		await page.goto(ROUTES.programs);
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
});
