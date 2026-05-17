import { NextRequest, NextResponse } from "next/server";

import { requireApiUserId, routeErrorResponse } from "@/lib/api/server";
import { getRecentWorkoutsForHome } from "@/lib/progress/service";

export async function GET(request: NextRequest) {
	try {
		const userId = await requireApiUserId();
		const limitRaw = request.nextUrl.searchParams.get("limit");
		const parsed = parseInt(limitRaw ?? "5", 10);
		const limit = Number.isFinite(parsed) ? Math.min(50, Math.max(1, parsed)) : 5;

		const workouts = await getRecentWorkoutsForHome(userId, limit);

		return NextResponse.json(workouts);
	} catch (error) {
		return routeErrorResponse(error, "GET /api/home/recent-workouts");
	}
}
