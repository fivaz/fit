import { NextRequest, NextResponse } from "next/server";

import { requireApiUserId, routeErrorResponse } from "@/lib/api/server";
import { finishWorkout } from "@/lib/workout/service";

type WorkoutRouteParams = {
	params: Promise<{ id: string }>;
};

export async function POST(_request: NextRequest, { params }: WorkoutRouteParams) {
	try {
		const userId = await requireApiUserId();
		const { id } = await params;

		await finishWorkout(id, userId);

		return new NextResponse(null, { status: 204 });
	} catch (error) {
		return routeErrorResponse(error, "POST /api/workouts/[id]/finish");
	}
}
