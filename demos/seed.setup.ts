import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { test as setup } from "@playwright/test";

import {
	buildTestUser,
	loginWithEmailPassword,
	signUpTestUser,
	type TestUser,
} from "@/tests/e2e/helpers/auth";

import { DEMO_STATE_FILE, RAW_DIR, STORAGE_STATE_FILE } from "./support/paths";

setup("seed demo account", async ({ page, request }) => {
	// Not the E2E `test` from tests/e2e/fixtures: its auto fixture deletes the user when this test
	// ends, but the demo user has to outlive seeding. The cleanup project deletes it after recording.
	const user: TestUser = { ...buildTestUser("portfolio-demo"), name: "Alex Morgan" };

	// Start from a clean slate so clips from an earlier run can't be mistaken for fresh ones.
	fs.rmSync(RAW_DIR, { recursive: true, force: true });

	await setup.step("Create the demo user", async () => {
		await signUpTestUser(request, user);
		// Written immediately so the cleanup project can delete the user even if seeding fails later.
		fs.mkdirSync(path.dirname(DEMO_STATE_FILE), { recursive: true });
		fs.writeFileSync(DEMO_STATE_FILE, JSON.stringify({ email: user.email }));
	});

	await setup.step("Seed programs and ~8 weeks of workout history in the DB", async () => {
		// Direct DB script: the UI can't backdate workouts. It refuses non-local databases. It needs
		// the shared exercise library (`pnpm --filter @fit/api exercises-seed`), which the AI clip
		// also relies on, since generation only picks from the user's catalog.
		execFileSync("pnpm", ["exec", "tsx", "scripts/seed-demo-data.ts", user.email], {
			cwd: path.join(process.cwd(), "apps/api"),
			stdio: "inherit",
			env: process.env,
		});
	});

	await setup.step("Log in and save the session for the recordings", async () => {
		await loginWithEmailPassword(page, user);
		fs.mkdirSync(path.dirname(STORAGE_STATE_FILE), { recursive: true });
		await page.context().storageState({ path: STORAGE_STATE_FILE });
	});
});
