import { execFileSync } from "node:child_process";

const registeredEmails: string[] = [];

export function registerTestUserEmail(email: string) {
	if (!registeredEmails.includes(email)) {
		registeredEmails.push(email);
	}
}

/**
 * Deletes the Better Auth user and cascaded app data (programs, workouts, etc.).
 * Runs the Prisma script in a subprocess to avoid ESM/CJS issues with the generated client in the test runner.
 */
export function deleteTestUserByEmail(email: string) {
	if (!process.env.DATABASE_URL) {
		console.warn(`[E2E] DATABASE_URL not set; skipping DB cleanup for ${email}`);
		return;
	}

	try {
		execFileSync("pnpm", ["exec", "tsx", "scripts/delete-e2e-user-by-email.ts", email], {
			cwd: process.cwd(),
			stdio: "pipe",
			env: process.env,
		});
	} catch (error) {
		console.warn(`[E2E] Failed to delete test user ${email}:`, error);
	}
}

export function flushRegisteredTestUsers() {
	while (registeredEmails.length > 0) {
		const email = registeredEmails.pop();
		if (email) deleteTestUserByEmail(email);
	}
}
