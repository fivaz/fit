import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { logError } from "@/lib/logger";

import "server-only";

export class ApiError extends Error {
	constructor(
		message: string,
		public readonly status: number,
	) {
		super(message);
		this.name = "ApiError";
	}
}

async function getSessionUserId() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	return session?.user.id ?? null;
}

export async function requireApiUserId() {
	const userId = await getSessionUserId();

	if (!userId) {
		throw new ApiError("Unauthorized", 401);
	}

	return userId;
}

export function routeErrorResponse(error: unknown, context: string) {
	if (error instanceof ApiError) {
		return NextResponse.json({ error: error.message }, { status: error.status });
	}

	logError(error, context);
	return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function readJson<T>(request: Request): Promise<T> {
	try {
		return (await request.json()) as T;
	} catch {
		throw new ApiError("Invalid JSON body", 400);
	}
}
