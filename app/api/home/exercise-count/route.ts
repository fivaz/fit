import { NextResponse } from "next/server";

import { requireApiUserId, routeErrorResponse } from "@/lib/api/server";
import { countExerciseLibrary } from "@/lib/exercise/service";

export async function GET() {
	try {
		const userId = await requireApiUserId();
		const count = await countExerciseLibrary(userId);

		return NextResponse.json({ count });
	} catch (error) {
		return routeErrorResponse(error, "GET /api/home/exercise-count");
	}
}
