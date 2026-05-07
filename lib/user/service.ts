import { revalidatePath } from "next/cache";

import { ROUTES } from "@/lib/consts";
import { logError } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

import "server-only";

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

		revalidatePath(ROUTES.HOME);

		return { success: true };
	} catch (error) {
		logError(error, "updateTimezone");
		throw error;
	}
}
