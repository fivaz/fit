import { NextRequest, NextResponse } from "next/server";

import { readJson, requireApiUserId, routeErrorResponse } from "@/lib/api/server";
import { syncWorkoutSets } from "@/lib/workout/service";
import { WorkoutSetMap } from "@/lib/workout/type";

type WorkoutSetsRouteParams = {
	params: Promise<{ id: string }>;
};

type SyncWorkoutSetsBody = {
	exerciseSetsMap?: WorkoutSetMap;
};

export async function PUT(request: NextRequest, { params }: WorkoutSetsRouteParams) {
	try {
		const userId = await requireApiUserId();
		const { id } = await params;
		const { exerciseSetsMap } = await readJson<SyncWorkoutSetsBody>(request);

		if (!exerciseSetsMap) {
			return NextResponse.json({ error: "exerciseSetsMap is required" }, { status: 400 });
		}

		const result = await syncWorkoutSets(id, exerciseSetsMap, userId);

		return NextResponse.json(result);
	} catch (error) {
		return routeErrorResponse(error, "PUT /api/workouts/[id]/sets");
	}
}
