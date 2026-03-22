"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/consts";
import { logError } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

/**
 * Updates the user's IANA timezone string in the database.
 * This is triggered by the client-side sync hook.
 */
export async function updateTimezoneAction(newTimezone: string) {
	try {
		const validTimezones = Intl.supportedValuesOf("timeZone");
		if (!validTimezones.includes(newTimezone)) {
			// Throwing here ensures the .catch() on the caller side is triggered
			throw new Error(`Invalid timezone: ${newTimezone}`);
		}

		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			throw new Error("Unauthorized: No active session found");
		}

		await prisma.user.update({
			where: { id: session.user.id },
			data: {
				timezone: newTimezone,
			},
		});

		revalidatePath(ROUTES.HOME);

		return { success: true };
	} catch (error) {
		// 1. Log it for server-side debugging
		logError(error, "updateTimezoneAction");

		// 2. Re-throw so the parent's .catch() block executes
		throw error;
	}
}
