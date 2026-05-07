import { NextResponse } from "next/server";

import { requireApiUserId, routeErrorResponse } from "@/lib/api/server";
import { getActiveWorkout } from "@/lib/workout/service";

export async function GET() {
	try {
		const userId = await requireApiUserId();
		const activeWorkout = await getActiveWorkout(userId);

		return NextResponse.json(activeWorkout);
	} catch (error) {
		return routeErrorResponse(error, "GET /api/workouts/active");
	}
}
