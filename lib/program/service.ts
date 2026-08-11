import { revalidatePath } from "next/cache";

import { ROUTES } from "@/lib/consts";
import { mapExerciseToUI } from "@/lib/exercise/utils";
import { MuscleGroup, Prisma } from "@/lib/generated/prisma/client";
import { logError } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { SanitizedGenerationResult } from "@/lib/program/generate-schema";
import {
	ProgramUI,
	programUISelect,
	ProgramWithExercises,
	programWithExercisesArgs,
} from "@/lib/program/type";
import { ProgramGroupUI, programGroupUISelect } from "@/lib/program-group/type";
import { devDelay } from "@/lib/utils";

import "server-only";

type ProgramWithExercisesRaw = Prisma.ProgramGetPayload<typeof programWithExercisesArgs>;

export interface ProgramRepository {
	getPrograms(userId: string): Promise<ProgramUI[]>;
	getProgramById(id: string, userId: string): Promise<ProgramWithExercisesRaw | null>;
	upsertProgram(
		program: Pick<ProgramUI, "id" | "name" | "muscles" | "groupId" | "order">,
		userId: string,
	): Promise<void>;
	reorderPrograms(groupId: string | null, sortedIds: string[], userId: string): Promise<void>;
	deleteProgram(id: string, userId: string): Promise<void>;
	hasOwnedProgram(programId: string, userId: string): Promise<boolean>;
	replaceProgramExercises(programId: string, exerciseIds: string[]): Promise<void>;
	createProgramsWithExercises(
		programs: Array<{ id: string; name: string; muscles: MuscleGroup[]; exerciseIds: string[] }>,
		userId: string,
		group?: { id: string; name: string },
	): Promise<string[]>;
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
	async upsertProgram({ id, name, muscles, groupId, order }, userId) {
		const programCount = await prisma.program.count({
			where: { userId, groupId: groupId ?? null },
		});

		await prisma.program.upsert({
			where: { id: id || "new-id", userId },
			update: { name, muscles, groupId: groupId ?? null, order },
			create: {
				id,
				name,
				muscles,
				groupId: groupId ?? null,
				userId,
				order: programCount,
			},
		});
	},
	async reorderPrograms(groupId, sortedIds, userId) {
		if (sortedIds.length === 0) return;

		await prisma.$transaction(
			sortedIds.map((id, index) =>
				prisma.program.update({
					where: { id, userId },
					data: { order: index, groupId: groupId ?? null },
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
	async createProgramsWithExercises(programs, userId, group) {
		await prisma.$transaction(async (tx) => {
			let groupId: string | null = null;

			if (group && programs.length > 1) {
				const groupCount = await tx.programGroup.count({ where: { userId } });
				await tx.programGroup.create({
					data: {
						id: group.id,
						name: group.name,
						userId,
						order: groupCount,
					},
				});
				groupId = group.id;
			}

			for (const [index, program] of programs.entries()) {
				await tx.program.upsert({
					where: { id: program.id, userId },
					update: {
						name: program.name,
						muscles: program.muscles,
						groupId,
						order: index,
					},
					create: {
						id: program.id,
						name: program.name,
						muscles: program.muscles,
						userId,
						groupId,
						order: index,
					},
				});
				await tx.programToExercise.deleteMany({ where: { programId: program.id } });
				if (program.exerciseIds.length > 0) {
					await tx.programToExercise.createMany({
						data: program.exerciseIds.map((exerciseId, order) => ({
							programId: program.id,
							exerciseId,
							order,
						})),
					});
				}
			}
		});
		return programs.map((program) => program.id);
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
		async saveProgram({ id, name, muscles, groupId, order }: ProgramUI, userId: string) {
			await devDelay();
			try {
				await repository.upsertProgram({ id, name, muscles, groupId, order }, userId);
				revalidatePath(ROUTES.PROGRAMS);
			} catch (error) {
				logError(error, "saveProgram", { extra: { id, name, muscles, groupId, order, userId } });
				throw new Error("Failed to save program");
			}
		},
		async reorderPrograms(groupId: string | null, sortedIds: string[], userId: string) {
			await devDelay();
			try {
				await repository.reorderPrograms(groupId, sortedIds, userId);
				revalidatePath(ROUTES.PROGRAMS);
			} catch (error) {
				logError(error, "reorderPrograms", { extra: { groupId, sortedIds, userId } });
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
		async createGeneratedPrograms(
			{ groupName, programs }: SanitizedGenerationResult,
			userId: string,
		) {
			await devDelay();
			try {
				const programsWithIds = programs.map((program) => ({
					id: crypto.randomUUID(),
					name: program.name,
					muscles: program.muscles,
					exerciseIds: program.exerciseIds,
				}));

				const group =
					groupName && programsWithIds.length > 1
						? { id: crypto.randomUUID(), name: groupName }
						: undefined;

				const programIds = await repository.createProgramsWithExercises(
					programsWithIds,
					userId,
					group,
				);
				revalidatePath(ROUTES.PROGRAMS);

				const createdPrograms: ProgramWithExercises[] = [];
				for (const id of programIds) {
					const program = await repository.getProgramById(id, userId);
					if (!program) continue;
					createdPrograms.push({
						...program,
						exercises: program.exercises.map(({ exercise, order }) => ({
							...mapExerciseToUI(exercise),
							order,
						})),
					});
				}

				const createdGroup: ProgramGroupUI | null = group
					? await prisma.programGroup.findFirst({
							where: { id: group.id, userId },
							...programGroupUISelect,
						})
					: null;

				return { programs: createdPrograms, group: createdGroup };
			} catch (error) {
				logError(error, "createGeneratedPrograms", { extra: { userId, count: programs.length } });
				throw new Error("Failed to save generated programs");
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
export const createGeneratedPrograms = programService.createGeneratedPrograms;
