"use server";
import { revalidatePath } from "next/cache";

import { ROUTES } from "@/lib/consts";
import { mapExerciseToUI } from "@/lib/exercise/utils";
import { logError } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import {
	ProgramUI,
	programUISelect,
	ProgramWithExercises,
	programWithExercisesArgs,
} from "@/lib/program/type";
import { devDelay } from "@/lib/utils";
import { getUserId } from "@/lib/utils-server";

import "server-only";

/**
 * Fetches all programs for the current user.
 */
export async function getProgramsAction(): Promise<ProgramUI[]> {
	await devDelay();

	const userId = await getUserId();

	return prisma.program.findMany({
		where: { userId },
		...programUISelect,
		orderBy: {
			order: "asc" as const,
		},
	});
}

/**
 * Public fetcher for a single program.
 */
export async function getProgramByIdAction(id: string): Promise<ProgramWithExercises | null> {
	await devDelay();
	const userId = await getUserId();
	const program = await prisma.program.findFirst({
		where: { id, userId },
		...programWithExercisesArgs,
	});

	if (!program) return null;


	// Mapping the nested 'exercise' objects into a flat array
	return {
		...program,
		exercises: program.exercises.map(({ exercise, order }) => ({
			...mapExerciseToUI(exercise),
			order,
		})),
	};
}

/**
 * Saves or updates a program.
 */
export async function saveProgramAction({ id, name, muscles }: ProgramUI) {
	await devDelay();

	const userId = await getUserId();

	try {
		await prisma.program.upsert({
			where: { id: id || "new-id" },
			update: {
				name,
				muscles,
			},
			create: {
				id,
				name,
				muscles,
				userId,
			},
		});

		revalidatePath(ROUTES.PROGRAMS);
	} catch (error) {
		logError(error, {
			extra: { context: "error saving program", id, name, muscles, userId },
		});
		throw new Error("Failed to save program");
	}
}

/**
 * Updates the order of programs.
 */
export async function reorderProgramsAction(sortedIds: string[]) {
	await devDelay();

	try {
		await prisma.$transaction(
			sortedIds.map((id, index) =>
				prisma.program.update({
					where: { id },
					data: { order: index },
				}),
			),
		);

		revalidatePath(ROUTES.PROGRAMS);
	} catch (error) {
		logError(error, {
			extra: { context: "error updating program order", sortedIds },
		});
		throw new Error("Failed to update program order");
	}
}

/**
 * Deletes a program.
 */
export async function deleteProgramAction(id: string) {
	await devDelay();

	const userId = await getUserId();

	try {
		await prisma.program.delete({
			where: { id, userId },
		});

		revalidatePath(ROUTES.PROGRAMS);
	} catch (error) {
		logError(error, {
			extra: { context: "error deleting program", id, userId },
		});
		throw new Error("Deletion failed");
	}
}

/**
 * Updates exercises linked to a program.
 */
export async function updateProgramExercisesAction(exerciseIds: string[], programId: string) {
	const userId = await getUserId();

	try {
		const program = await prisma.program.findFirst({
			where: { id: programId, userId },
		});

		if (!program) throw new Error("Program not found or not owned by user");

		await prisma.$transaction([
			// Delete existing relations
			prisma.programToExercise.deleteMany({ where: { programId } }),
			// Insert new relations with order
			prisma.programToExercise.createMany({
				data: exerciseIds.map((exerciseId, index) => ({
					programId,
					exerciseId,
					order: index,
				})),
			}),
		]);

		revalidatePath(`${ROUTES.PROGRAMS}/${programId}`);
	} catch (error) {
		logError(error, {
			extra: {
				context: "error updating program exercises",
				programId,
				exerciseIds,
				userId,
			},
		});
		throw new Error("Failed to update program exercises");
	}
}
