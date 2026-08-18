import { type APIRequestContext, expect, type Page } from "@playwright/test";

import { ROUTES } from "@/lib/consts";
import { registerTestUserEmail } from "@/tests/e2e/helpers/test-user-cleanup";

export type TestUser = {
	email: string;
	password: string;
	name: string;
};

const AUTH_API_BASE = process.env.NEXT_PUBLIC_AUTH_BASE_URL ?? "http://localhost:3001";

export function buildTestUser(prefix: string): TestUser {
	const credential = `${prefix}-${Date.now()}@example.com`;
	return {
		email: credential,
		password: credential,
		name: "Playwright E2E",
	};
}

export async function signUpTestUser(request: APIRequestContext, user: TestUser) {
	const signupResponse = await request.post(`${AUTH_API_BASE}/api/auth/sign-up/email`, {
		data: {
			email: user.email,
			password: user.password,
			name: user.name,
			callbackURL: ROUTES.HOME,
		},
	});
	expect(signupResponse.ok()).toBeTruthy();
	registerTestUserEmail(user.email);
}

export async function loginWithEmailPassword(page: Page, user: TestUser) {
	await page.goto(ROUTES.LOGIN);
	await page.getByLabel("Email").fill(user.email);
	await page.getByLabel("Password").fill(user.password);

	const signInResponsePromise = page.waitForResponse((response) => {
		return (
			/\/api\/auth\/sign-in\/email$/.test(response.url()) &&
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
