import { NextRequest, NextResponse } from "next/server";

import { readJson, requireApiUserId, routeErrorResponse } from "@/lib/api/server";
import { startWorkout } from "@/lib/workout/service";

type StartWorkoutBody = {
	programId?: string;
};

export async function POST(request: NextRequest) {
	try {
		const userId = await requireApiUserId();
		const { programId } = await readJson<StartWorkoutBody>(request);

		if (!programId) {
			return NextResponse.json({ error: "programId is required" }, { status: 400 });
		}

		const id = await startWorkout(programId, userId);

		return NextResponse.json({ id }, { status: 201 });
	} catch (error) {
		return routeErrorResponse(error, "POST /api/workouts");
	}
}
