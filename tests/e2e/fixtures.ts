import { expect, test as base } from "@playwright/test";

import { flushRegisteredTestUsers } from "@/tests/e2e/helpers/test-user-cleanup";

const test = base;

test.afterEach(() => {
	flushRegisteredTestUsers();
});

export { expect, test };
