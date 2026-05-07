import { prisma } from "@/lib/prisma";

import "dotenv/config";

const email = process.argv[2];

async function main() {
	if (!email) {
		console.error("Usage: pnpm exec tsx scripts/delete-e2e-user-by-email.ts <email>");
		process.exit(1);
	}

	const result = await prisma.user.deleteMany({ where: { email } });
	if (result.count === 0) {
		console.warn(`[e2e-cleanup] No user found for email=${email}`);
	}
}

void main().finally(() => prisma.$disconnect());
