import { NextRequest, NextResponse } from "next/server";

import { readJson, requireApiUserId, routeErrorResponse } from "@/lib/api/server";
import { reorderProgramExercises } from "@/lib/exercise/service";

type ProgramExercisesRouteParams = {
	params: Promise<{ id: string }>;
};

type ReorderProgramExercisesBody = {
	exerciseIds?: string[];
};

export async function PATCH(request: NextRequest, { params }: ProgramExercisesRouteParams) {
	try {
		const userId = await requireApiUserId();
		const { id } = await params;
		const { exerciseIds } = await readJson<ReorderProgramExercisesBody>(request);

		if (!exerciseIds) {
			return NextResponse.json({ error: "exerciseIds is required" }, { status: 400 });
		}

		await reorderProgramExercises(id, exerciseIds, userId);

		return new NextResponse(null, { status: 204 });
	} catch (error) {
		return routeErrorResponse(error, "PATCH /api/programs/[id]/exercises/reorder");
	}
}
