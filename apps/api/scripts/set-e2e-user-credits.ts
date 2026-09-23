import "../src/load-env.js";

import { prisma } from "../src/prisma/client.js";

const email = process.argv[2];
const credits = Number(process.argv[3]);

async function main() {
	if (!email || Number.isNaN(credits)) {
		console.error("Usage: pnpm exec tsx scripts/set-e2e-user-credits.ts <email> <credits>");
		process.exit(1);
	}

	const result = await prisma.user.updateMany({ where: { email }, data: { credits } });
	if (result.count === 0) {
		console.warn(`[e2e-set-credits] No user found for email=${email}`);
	}
}

void main().finally(() => prisma.$disconnect());
