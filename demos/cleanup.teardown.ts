import fs from "node:fs";

import { test as teardown } from "@playwright/test";

import { deleteTestUserByEmail } from "@/tests/e2e/helpers/test-user-cleanup";

import { DEMO_STATE_FILE, STORAGE_STATE_FILE } from "./support/paths";

teardown("delete the demo user", () => {
	if (!fs.existsSync(DEMO_STATE_FILE)) return;

	const { email } = JSON.parse(fs.readFileSync(DEMO_STATE_FILE, "utf8")) as { email: string };
	deleteTestUserByEmail(email);

	fs.rmSync(DEMO_STATE_FILE, { force: true });
	fs.rmSync(STORAGE_STATE_FILE, { force: true });
});
