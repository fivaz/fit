import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/consts";

import "server-only";

export async function getSessionUserId() {
	const session = await auth.api.getSession({
		headers: await headers(), // you need to pass the headers object.
	});

	return session?.user.id ?? null;
}

export async function getUserId() {
	const userId = await getSessionUserId();

	if (!userId) {
		redirect(ROUTES.LOGIN);
	}

	return userId;
}
