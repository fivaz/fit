import { logError } from "@/logger";
import { prisma } from "@/prisma/client";

export async function updateTimezone(newTimezone: string, userId: string) {
	try {
		const validTimezones = Intl.supportedValuesOf("timeZone");
		if (!validTimezones.includes(newTimezone)) {
			throw new Error(`Invalid timezone: ${newTimezone}`);
		}

		await prisma.user.update({
			where: { id: userId },
			data: {
				timezone: newTimezone,
			},
		});

		return { success: true };
	} catch (error) {
		logError(error, "updateTimezone");
		throw error;
	}
}
