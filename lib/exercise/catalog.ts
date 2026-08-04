import { Prisma } from "@/lib/generated/prisma/client";
import { type MuscleGroupType } from "@/lib/muscle/type";
import { prisma } from "@/lib/prisma";

import "server-only";

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

export function buildCatalogIdSet(catalog: ExerciseCatalogItem[]): Set<string> {
	return new Set(catalog.map((exercise) => exercise.id));
}
