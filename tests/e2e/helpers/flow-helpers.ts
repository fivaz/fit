import { type APIRequestContext, expect, type Locator, type Page } from "@playwright/test";

import { ROUTES } from "@/lib/consts";

export type TestUser = {
	email: string;
	password: string;
	name: string;
};

const AUTH_API_ROUTES = {
	authEmailSignUpApi: /\/api\/auth\/sign-up\/email$/,
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
	console.log(`[E2E USER] email=${user.email}`);
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

export async function createProgram(page: Page, name: string) {
	await page.goto(ROUTES.PROGRAMS);
	await page.getByRole("button", { name: "Create program" }).click();
	await expect(page.getByRole("heading", { name: "Create Program" })).toBeVisible();
	await page.getByLabel("Program Name").fill(name);
	await page.getByRole("button", { name: /chest/i }).click();
	await page.getByRole("button", { name: "Create Program" }).click();
	await expect(page.getByText("Program created successfully.")).toBeVisible();
}

export async function createExercise(page: Page, name: string) {
	await page.goto(ROUTES.EXERCISES);
	await page.getByRole("button", { name: "Create exercise" }).click();
	await expect(page.getByRole("heading", { name: "Create Exercise" })).toBeVisible();
	await page.getByLabel("Exercise Name").fill(name);
	await page.getByRole("button", { name: /chest/i }).click();
	await page.getByRole("button", { name: "Create Exercise" }).click();
	await expect(page.getByText("Exercise created successfully.")).toBeVisible();
}

export async function dragToTarget(page: Page, source: Locator, target: Locator) {
	await source.scrollIntoViewIfNeeded();
	await target.scrollIntoViewIfNeeded();
	await expect(source).toBeVisible();
	await expect(target).toBeVisible();

	const sourceBox = await source.boundingBox();
	const targetBox = await target.boundingBox();

	if (!sourceBox || !targetBox) {
		throw new Error("Could not determine drag source/target positions.");
	}

	await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
	await page.mouse.down();
	await page.waitForTimeout(120);
	await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, {
		steps: 20,
	});
	await page.mouse.move(
		targetBox.x + targetBox.width / 2,
		targetBox.y + targetBox.height / 2 + 24,
		{
			steps: 10,
		},
	);
	await page.mouse.up();
	await page.waitForTimeout(150);
}

export async function waitForLabeledItem(
	page: Page,
	role: "link" | "button",
	namePattern: RegExp,
	expectedSubstring: string,
) {
	await expect
		.poll(
			async () => {
				return page
					.getByRole(role, { name: namePattern })
					.evaluateAll((elements) =>
						elements.map((element) => element.getAttribute("aria-label") ?? ""),
					);
			},
			{ timeout: 15_000 },
		)
		.toContainEqual(expect.stringContaining(expectedSubstring));
}
