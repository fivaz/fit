import { revalidatePath } from "next/cache";

import { ROUTES } from "@/lib/consts";
import { mapExerciseToUI } from "@/lib/exercise/utils";
import { Prisma } from "@/lib/generated/prisma/client";
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

type ProgramWithExercisesRaw = Prisma.ProgramGetPayload<typeof programWithExercisesArgs>;

export interface ProgramRepository {
	getPrograms(userId: string): Promise<ProgramUI[]>;
	getProgramById(id: string, userId: string): Promise<ProgramWithExercisesRaw | null>;
	upsertProgram(program: Pick<ProgramUI, "id" | "name" | "muscles">, userId: string): Promise<void>;
	reorderPrograms(sortedIds: string[], userId: string): Promise<void>;
	deleteProgram(id: string, userId: string): Promise<void>;
	hasOwnedProgram(programId: string, userId: string): Promise<boolean>;
	replaceProgramExercises(programId: string, exerciseIds: string[]): Promise<void>;
}

const prismaProgramRepository: ProgramRepository = {
	async getPrograms(userId) {
		return prisma.program.findMany({
			where: { userId },
			...programUISelect,
			orderBy: { order: "asc" as const },
		});
	},
	async getProgramById(id, userId) {
		return prisma.program.findFirst({
			where: { id, userId },
			...programWithExercisesArgs,
		});
	},
	async upsertProgram({ id, name, muscles }, userId) {
		await prisma.program.upsert({
			where: { id: id || "new-id", userId },
			update: { name, muscles },
			create: { id, name, muscles, userId },
		});
	},
	async reorderPrograms(sortedIds, userId) {
		await prisma.$transaction(
			sortedIds.map((id, index) =>
				prisma.program.update({
					where: { id, userId },
					data: { order: index },
				}),
			),
		);
	},
	async deleteProgram(id, userId) {
		await prisma.program.delete({ where: { id, userId } });
	},
	async hasOwnedProgram(programId, userId) {
		const program = await prisma.program.findFirst({ where: { id: programId, userId } });
		return !!program;
	},
	async replaceProgramExercises(programId, exerciseIds) {
		await prisma.$transaction([
			prisma.programToExercise.deleteMany({ where: { programId } }),
			prisma.programToExercise.createMany({
				data: exerciseIds.map((exerciseId, index) => ({ programId, exerciseId, order: index })),
			}),
		]);
	},
};

export function createProgramService(repository: ProgramRepository) {
	return {
		async getPrograms(userId: string): Promise<ProgramUI[]> {
			await devDelay();
			return repository.getPrograms(userId);
		},
		async getProgramById(id: string, userId: string): Promise<ProgramWithExercises | null> {
			await devDelay();
			const program = await repository.getProgramById(id, userId);
			if (!program) return null;

			return {
				...program,
				exercises: program.exercises.map(({ exercise, order }) => ({
					...mapExerciseToUI(exercise),
					order,
				})),
			};
		},
		async saveProgram({ id, name, muscles }: ProgramUI, userId: string) {
			await devDelay();
			try {
				await repository.upsertProgram({ id, name, muscles }, userId);
				revalidatePath(ROUTES.PROGRAMS);
			} catch (error) {
				logError(error, "saveProgram", { extra: { id, name, muscles, userId } });
				throw new Error("Failed to save program");
			}
		},
		async reorderPrograms(sortedIds: string[], userId: string) {
			await devDelay();
			try {
				await repository.reorderPrograms(sortedIds, userId);
				revalidatePath(ROUTES.PROGRAMS);
			} catch (error) {
				logError(error, "reorderPrograms", { extra: { sortedIds, userId } });
				throw new Error("Failed to update program order");
			}
		},
		async deleteProgram(id: string, userId: string) {
			await devDelay();
			try {
				await repository.deleteProgram(id, userId);
				revalidatePath(ROUTES.PROGRAMS);
			} catch (error) {
				logError(error, "deleteProgram", { extra: { id, userId } });
				throw new Error("Deletion failed");
			}
		},
		async updateProgramExercises(exerciseIds: string[], programId: string, userId: string) {
			try {
				const hasProgram = await repository.hasOwnedProgram(programId, userId);
				if (!hasProgram) throw new Error("Program not found or not owned by user");
				await repository.replaceProgramExercises(programId, exerciseIds);
				revalidatePath(ROUTES.PROGRAMS);
			} catch (error) {
				logError(error, "updateProgramExercises", {
					extra: { programId, exerciseIds, userId },
				});
				throw new Error("Failed to update program exercises");
			}
		},
	};
}

const programService = createProgramService(prismaProgramRepository);

export const getPrograms = programService.getPrograms;
export const getProgramById = programService.getProgramById;
export const saveProgram = programService.saveProgram;
export const reorderPrograms = programService.reorderPrograms;
export const deleteProgram = programService.deleteProgram;
export const updateProgramExercises = programService.updateProgramExercises;
