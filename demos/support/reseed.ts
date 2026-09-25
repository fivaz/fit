import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { setE2eUserCredits } from "@/tests/e2e/helpers/billing";

import { DEMO_STATE_FILE } from "./paths";

/** A new account's free AI generations (the `credits` default in schema.prisma). */
export const FREE_CREDITS = 10;

/**
 * Resets the demo user's programs, workout history and credits to the seeded baseline. Every clip
 * starts from the same state, so what one clip creates (today's workout, AI-generated programs,
 * purchased credits) never leaks into the next one's first frame.
 */
export function reseedDemoData(credits: number = FREE_CREDITS): void {
	const { email } = JSON.parse(fs.readFileSync(DEMO_STATE_FILE, "utf8")) as { email: string };
	execFileSync("pnpm", ["exec", "tsx", "scripts/seed-demo-data.ts", email], {
		cwd: path.join(process.cwd(), "apps/api"),
		stdio: "pipe",
		env: process.env,
	});
	setE2eUserCredits(email, credits);
}
