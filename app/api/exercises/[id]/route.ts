import { NextRequest, NextResponse } from "next/server";

import { requireApiUserId, routeErrorResponse } from "@/lib/api/server";
import { deleteExercise } from "@/lib/exercise/service";

type ExerciseRouteParams = {
	params: Promise<{ id: string }>;
};

export async function DELETE(_request: NextRequest, { params }: ExerciseRouteParams) {
	try {
		const userId = await requireApiUserId();
		const { id } = await params;

		await deleteExercise(id, userId);

		return new NextResponse(null, { status: 204 });
	} catch (error) {
		return routeErrorResponse(error, "DELETE /api/exercises/[id]");
	}
}
