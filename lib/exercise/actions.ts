"use server";

import { revalidatePath } from "next/cache";

import { PAGE_SIZE, ROUTES } from "@/lib/consts";
import { ExerciseUI, exerciseUIArgs } from "@/lib/exercise/type";
import { mapExerciseToUI } from "@/lib/exercise/utils";
import { MuscleGroup, Prisma } from "@/lib/generated/prisma/client";
import { logError } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { devDelay } from "@/lib/utils";
import { getUserId } from "@/lib/utils-server";

import "server-only";

export async function getExercisesSearchAction({
	search,
	muscles,
	page = 1,
	pageSize = PAGE_SIZE,
}: {
	search?: string;
	muscles?: MuscleGroup[];
	page: number;
	pageSize?: number;
}) {
	// 1. Split the search string into individual words and filter out empty strings
	const searchWords = search?.trim().split(/\s+/).filter(Boolean) || [];

	const filter: Prisma.ExerciseWhereInput = {
		AND: [
			// 2. Map each word to a "contains" check
			...searchWords.map((word) => ({
				name: { contains: word, mode: "insensitive" as Prisma.QueryMode },
			})),
			{
				muscles: { hasSome: muscles },
			},
		],
	};

	return getExercisesAction(filter, page, pageSize);
}

/**
 * Fetches all exercises for the current user.
 */
export async function getExercisesAction(
	filter?: Prisma.ExerciseWhereInput,
	page: number = 1,
	pageSize: number = PAGE_SIZE,
): Promise<ExerciseUI[]> {
	await devDelay();

	const userId = await getUserId();

	// Calculate how many items to skip for pagination
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

/**
 * Saves or updates an exercise from FormData.
 */
export async function saveExerciseAction({ id, name, muscles, imageUrl }: ExerciseUI) {
	const userId = await getUserId();
	try {
		await prisma.exercise.upsert({
			where: { id: id || "new-id" },
			update: {
				name,
				muscles,
				imageUrl,
			},
			create: {
				name,
				muscles,
				imageUrl,
				userId,
			},
		});

		revalidatePath(ROUTES.EXERCISES);
		revalidatePath(ROUTES.PROGRAMS);
	} catch (error) {
		logError(error, "saveExerciseAction", {
			extra: { id, name, muscles, imageUrl, userId },
		});
		throw new Error("Failed to save exercise");
	}
}

/**
 * Deletes an exercise.
 */
export async function deleteExerciseAction(id: string) {
	const userId = await getUserId();

	try {
		await prisma.exercise.delete({
			where: { id, userId },
		});

		revalidatePath(ROUTES.EXERCISES);
		revalidatePath(ROUTES.PROGRAMS);
	} catch (error) {
		logError(error, "deleteExerciseAction", {
			extra: { id, userId },
		});
		throw new Error("Deletion failed");
	}
}

/**
 * Reorders exercises in a program based on the order of the array.
 */
export async function reorderProgramExercisesAction(programId: string, exerciseIds: string[]) {
	try {
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
		logError(error, "reorderProgramExercisesAction", { extra: { programId, exerciseIds } });
		throw new Error("Failed to reorder program exercises");
	}
}
