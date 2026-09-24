import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { DEMO_STATE_FILE } from "./paths";

/**
 * Resets the demo user's programs and workout history to the seeded baseline. Every clip starts from
 * the same state, so what one clip creates (today's workout, AI-generated programs) never leaks into
 * the next one's first frame.
 */
export function reseedDemoData(): void {
	const { email } = JSON.parse(fs.readFileSync(DEMO_STATE_FILE, "utf8")) as { email: string };
	execFileSync("pnpm", ["exec", "tsx", "scripts/seed-demo-data.ts", email], {
		cwd: path.join(process.cwd(), "apps/api"),
		stdio: "pipe",
		env: process.env,
	});
}
