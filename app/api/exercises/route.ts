import { NextRequest, NextResponse } from "next/server";

import { readJson, requireApiUserId, routeErrorResponse } from "@/lib/api/server";
import { PAGE_SIZE } from "@/lib/consts";
import { getExercisesSearch, saveExercise } from "@/lib/exercise/service";
import { ExerciseUI } from "@/lib/exercise/type";
import { MuscleGroup } from "@/lib/generated/prisma/client";

export async function GET(request: NextRequest) {
	try {
		const userId = await requireApiUserId();
		const searchParams = request.nextUrl.searchParams;
		const page = Number(searchParams.get("page") || "1");
		const pageSize = Number(searchParams.get("pageSize") || String(PAGE_SIZE));
		const search = searchParams.get("search") || undefined;
		const muscles = searchParams.getAll("muscles") as MuscleGroup[];

		const exercises = await getExercisesSearch(userId, {
			search,
			muscles,
			page,
			pageSize,
		});

		return NextResponse.json(exercises);
	} catch (error) {
		return routeErrorResponse(error, "GET /api/exercises");
	}
}

export async function POST(request: NextRequest) {
	try {
		const userId = await requireApiUserId();
		const exercise = await readJson<ExerciseUI>(request);

		await saveExercise(exercise, userId);

		return new NextResponse(null, { status: 204 });
	} catch (error) {
		return routeErrorResponse(error, "POST /api/exercises");
	}
}
