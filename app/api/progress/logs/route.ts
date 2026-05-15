import { NextRequest, NextResponse } from "next/server";

import { ApiError, requireApiUserId, routeErrorResponse } from "@/lib/api/server";
import { getProgressWorkoutLogs } from "@/lib/progress/service";

export async function GET(request: NextRequest) {
	try {
		const userId = await requireApiUserId();
		const fromParam = request.nextUrl.searchParams.get("from");
		const toParam = request.nextUrl.searchParams.get("to");

		if (!fromParam || !toParam) {
			throw new ApiError("from and to query parameters are required", 400);
		}

		const from = new Date(fromParam);
		const to = new Date(toParam);

		if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
			throw new ApiError("Invalid from or to date", 400);
		}

		const logs = await getProgressWorkoutLogs(userId, from, to);

		return NextResponse.json(logs);
	} catch (error) {
		return routeErrorResponse(error, "GET /api/progress/logs");
	}
}
