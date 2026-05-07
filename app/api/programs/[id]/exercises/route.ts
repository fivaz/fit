import { NextRequest, NextResponse } from "next/server";

import { readJson, requireApiUserId, routeErrorResponse } from "@/lib/api/server";
import { updateProgramExercises } from "@/lib/program/service";

type ProgramExercisesRouteParams = {
	params: Promise<{ id: string }>;
};

type UpdateProgramExercisesBody = {
	exerciseIds?: string[];
};

export async function PUT(request: NextRequest, { params }: ProgramExercisesRouteParams) {
	try {
		const userId = await requireApiUserId();
		const { id } = await params;
		const { exerciseIds } = await readJson<UpdateProgramExercisesBody>(request);

		if (!exerciseIds) {
			return NextResponse.json({ error: "exerciseIds is required" }, { status: 400 });
		}

		await updateProgramExercises(exerciseIds, id, userId);

		return new NextResponse(null, { status: 204 });
	} catch (error) {
		return routeErrorResponse(error, "PUT /api/programs/[id]/exercises");
	}
}
