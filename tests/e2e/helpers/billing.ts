import { execFileSync } from "node:child_process";
import path from "node:path";

/**
 * Sets a test user's credit balance directly via the DB, so a paywall test can deterministically
 * reach 0 credits without 10 real OpenAI generations or a real Stripe purchase. Runs in a
 * subprocess for the same reason as deleteTestUserByEmail: avoids ESM/CJS issues with the
 * generated Prisma client inside the Playwright test runner.
 */
export function setE2eUserCredits(email: string, credits: number) {
	if (!process.env.DATABASE_URL) {
		console.warn(`[E2E] DATABASE_URL not set; skipping credit override for ${email}`);
		return;
	}

	execFileSync("pnpm", ["exec", "tsx", "scripts/set-e2e-user-credits.ts", email, String(credits)], {
		cwd: path.join(process.cwd(), "apps/api"),
		stdio: "pipe",
		env: process.env,
	});
}
