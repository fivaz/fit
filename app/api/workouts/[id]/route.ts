import { NextRequest, NextResponse } from "next/server";

import { requireApiUserId, routeErrorResponse } from "@/lib/api/server";
import { getWorkoutById } from "@/lib/workout/service";

type WorkoutRouteParams = {
	params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, { params }: WorkoutRouteParams) {
	try {
		const userId = await requireApiUserId();
		const { id } = await params;
		const workout = await getWorkoutById(id, userId);

		if (!workout) {
			return NextResponse.json({ error: "Workout not found" }, { status: 404 });
		}

		return NextResponse.json(workout);
	} catch (error) {
		return routeErrorResponse(error, "GET /api/workouts/[id]");
	}
}
