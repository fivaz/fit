import { logError } from "@/logger";
import { prisma } from "@/prisma/client";

/**
 * Opens a database connection while the API boots. Neon suspends an idle database, and resuming it
 * takes a moment; doing that now, in parallel with Nest's startup, spares the first user request
 * the wait. A failure is only logged: real requests retry and report errors on their own.
 */
export async function warmUpDatabase(): Promise<void> {
	try {
		await prisma.$queryRaw`SELECT 1`;
	} catch (error) {
		logError(error, "warmUpDatabase", { level: "warn" });
	}
}
