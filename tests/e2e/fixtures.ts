import { expect, test as base } from "@playwright/test";

import { flushRegisteredTestUsers } from "@/tests/e2e/helpers/test-user-cleanup";

const test = base.extend<{ cleanupTestUsers: void }>({
	cleanupTestUsers: [
		async ({}, use) => {
			await use();
			flushRegisteredTestUsers();
		},
		{ auto: true },
	],
});

export { expect, test };
