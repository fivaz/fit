import type { MuscleGroupType } from "@fit/shared";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/prisma/client";

export type ExerciseCatalogItem = {
	id: string;
	name: string;
	muscles: MuscleGroupType[];
	equipment: string | null;
	bodyPart: string | null;
	category: string | null;
};

function exerciseLibraryWhere(userId: string): Prisma.ExerciseWhereInput {
	return { OR: [{ userId }, { userId: null }] };
}

export async function getExerciseCatalogForUser(userId: string): Promise<ExerciseCatalogItem[]> {
	const exercises = await prisma.exercise.findMany({
		where: exerciseLibraryWhere(userId),
		select: {
			id: true,
			name: true,
			muscles: true,
			equipment: true,
			bodyPart: true,
			category: true,
		},
		orderBy: { name: "asc" },
	});

	return exercises;
}
