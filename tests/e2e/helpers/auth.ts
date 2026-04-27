import { type APIRequestContext, expect, type Page } from "@playwright/test";

import { ROUTES } from "@/lib/consts";

export type TestUser = {
	email: string;
	password: string;
	name: string;
};

const AUTH_API_ROUTES = {
	authEmailSignInApi: /\/api\/auth\/sign-in\/email$/,
} as const;

export function buildTestUser(prefix: string): TestUser {
	const credential = `${prefix}-${Date.now()}@example.com`;
	return {
		email: credential,
		password: credential,
		name: "Playwright E2E",
	};
}

export async function signUpTestUser(request: APIRequestContext, user: TestUser) {
	console.log(user.email);
	const signupResponse = await request.post("/api/auth/sign-up/email", {
		data: {
			email: user.email,
			password: user.password,
			name: user.name,
			callbackURL: ROUTES.HOME,
		},
	});
	expect(signupResponse.ok()).toBeTruthy();
}

export async function loginWithEmailPassword(page: Page, user: TestUser) {
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

export async function signUpAndLoginTestUser(
	page: Page,
	request: APIRequestContext,
	prefix: string,
): Promise<TestUser> {
	const user = buildTestUser(prefix);
	await signUpTestUser(request, user);
	await loginWithEmailPassword(page, user);
	return user;
}
