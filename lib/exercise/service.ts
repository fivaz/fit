import { revalidatePath } from "next/cache";

import { PAGE_SIZE, ROUTES } from "@/lib/consts";
import { ExerciseUI, exerciseUIArgs } from "@/lib/exercise/type";
import { mapExerciseToUI } from "@/lib/exercise/utils";
import { MuscleGroup, Prisma } from "@/lib/generated/prisma/client";
import { logError } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { devDelay } from "@/lib/utils";

import "server-only";

export async function getExercisesSearch(
	userId: string,
	{
		search,
		muscles,
		page = 1,
		pageSize = PAGE_SIZE,
	}: {
		search?: string;
		muscles?: MuscleGroup[];
		page: number;
		pageSize?: number;
	},
) {
	const searchWords = search?.trim().split(/\s+/).filter(Boolean) || [];

	const andFilters: Prisma.ExerciseWhereInput[] = searchWords.map((word) => ({
		name: { contains: word, mode: "insensitive" as Prisma.QueryMode },
	}));

	if (muscles?.length) {
		andFilters.push({
			muscles: { hasSome: muscles },
		});
	}

	const filter: Prisma.ExerciseWhereInput = andFilters.length ? { AND: andFilters } : {};

	return getExercises(userId, filter, page, pageSize);
}

export async function getExercises(
	userId: string,
	filter?: Prisma.ExerciseWhereInput,
	page: number = 1,
	pageSize: number = PAGE_SIZE,
): Promise<ExerciseUI[]> {
	await devDelay();

	const skip = (page - 1) * pageSize;

	const exercises = await prisma.exercise.findMany({
		where: {
			OR: [{ userId }, { userId: null }],
			...filter,
		},
		...exerciseUIArgs,
		orderBy: {
			name: "asc",
		},
		skip,
		take: pageSize,
	});

	return exercises.map(mapExerciseToUI);
}

export async function saveExercise({ id, name, muscles, imageUrl }: ExerciseUI, userId: string) {
	try {
		await prisma.exercise.upsert({
			where: { id: id || "new-id", userId },
			update: {
				name,
				muscles,
				imageUrl,
			},
			create: {
				id,
				name,
				muscles,
				imageUrl,
				userId,
			},
		});

		revalidatePath(ROUTES.EXERCISES);
		revalidatePath(ROUTES.PROGRAMS);
	} catch (error) {
		logError(error, "saveExercise", {
			extra: { id, name, muscles, imageUrl, userId },
		});
		throw new Error("Failed to save exercise");
	}
}

export async function deleteExercise(id: string, userId: string) {
	try {
		await prisma.exercise.delete({
			where: { id, userId },
		});

		revalidatePath(ROUTES.EXERCISES);
		revalidatePath(ROUTES.PROGRAMS);
	} catch (error) {
		logError(error, "deleteExercise", {
			extra: { id, userId },
		});
		throw new Error("Deletion failed");
	}
}

export async function reorderProgramExercises(
	programId: string,
	exerciseIds: string[],
	userId: string,
) {
	try {
		const program = await prisma.program.findFirst({
			where: { id: programId, userId },
			select: { id: true },
		});

		if (!program) {
			throw new Error("Program not found or not owned by user");
		}

		await prisma.$transaction(
			exerciseIds.map((exerciseId, index) =>
				prisma.programToExercise.update({
					where: {
						programId_exerciseId: { programId, exerciseId },
					},
					data: { order: index },
				}),
			),
		);
	} catch (error) {
		logError(error, "reorderProgramExercises", { extra: { programId, exerciseIds, userId } });
		throw new Error("Failed to reorder program exercises");
	}
}
