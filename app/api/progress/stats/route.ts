import { NextResponse } from "next/server";

import { requireApiUserId, routeErrorResponse } from "@/lib/api/server";
import { getProgressStats } from "@/lib/progress/service";

export async function GET() {
	try {
		const userId = await requireApiUserId();
		const stats = await getProgressStats(userId);

		return NextResponse.json(stats);
	} catch (error) {
		return routeErrorResponse(error, "GET /api/progress/stats");
	}
}
