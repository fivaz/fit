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

import "server-only";

export async function getPrograms(userId: string): Promise<ProgramUI[]> {
	await devDelay();

	return prisma.program.findMany({
		where: { userId },
		...programUISelect,
		orderBy: {
			order: "asc" as const,
		},
	});
}

export async function getProgramById(
	id: string,
	userId: string,
): Promise<ProgramWithExercises | null> {
	await devDelay();

	const program = await prisma.program.findFirst({
		where: { id, userId },
		...programWithExercisesArgs,
	});

	if (!program) return null;

	return {
		...program,
		exercises: program.exercises.map(({ exercise, order }) => ({
			...mapExerciseToUI(exercise),
			order,
		})),
	};
}

export async function saveProgram({ id, name, muscles }: ProgramUI, userId: string) {
	await devDelay();

	try {
		await prisma.program.upsert({
			where: { id: id || "new-id", userId },
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
		logError(error, "saveProgram", {
			extra: { id, name, muscles, userId },
		});
		throw new Error("Failed to save program");
	}
}

export async function reorderPrograms(sortedIds: string[], userId: string) {
	await devDelay();

	try {
		await prisma.$transaction(
			sortedIds.map((id, index) =>
				prisma.program.update({
					where: { id, userId },
					data: { order: index },
				}),
			),
		);

		revalidatePath(ROUTES.PROGRAMS);
	} catch (error) {
		logError(error, "reorderPrograms", { extra: { sortedIds, userId } });
		throw new Error("Failed to update program order");
	}
}

export async function deleteProgram(id: string, userId: string) {
	await devDelay();

	try {
		await prisma.program.delete({
			where: { id, userId },
		});

		revalidatePath(ROUTES.PROGRAMS);
	} catch (error) {
		logError(error, "deleteProgram", {
			extra: { id, userId },
		});
		throw new Error("Deletion failed");
	}
}

export async function updateProgramExercises(
	exerciseIds: string[],
	programId: string,
	userId: string,
) {
	try {
		const program = await prisma.program.findFirst({
			where: { id: programId, userId },
		});

		if (!program) throw new Error("Program not found or not owned by user");

		await prisma.$transaction([
			prisma.programToExercise.deleteMany({ where: { programId } }),
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
		logError(error, "updateProgramExercises", {
			extra: {
				programId,
				exerciseIds,
				userId,
			},
		});
		throw new Error("Failed to update program exercises");
	}
}
