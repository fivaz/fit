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
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { success: false, error: "Unauthorized" };
		}

		await prisma.user.update({
			where: { id: session.user.id },
			data: {
				timezone: newTimezone,
			},
		});

		revalidatePath(ROUTES.HOME);
	} catch (error) {
		logError(error, "updateTimezoneAction");
	}
}
