import { type ExerciseRaw, type ExerciseUI, type MuscleGroupType,PAGE_SIZE } from "@fit/shared";

import { exerciseUIArgs } from "@/exercise/select";
import { mapExerciseToUI } from "@/exercise/utils";
import { Prisma } from "@/generated/prisma/client";
import { logError } from "@/logger";
import { prisma } from "@/prisma/client";
import { devDelay } from "@/utils";

type ExerciseSearchParams = {
	search?: string;
	muscles?: MuscleGroupType[];
	page: number;
	pageSize?: number;
};

function exerciseLibraryWhere(userId: string): Prisma.ExerciseWhereInput {
	return { OR: [{ userId }, { userId: null }] };
}

export interface ExerciseRepository {
	findExercises(
		userId: string,
		filter: Prisma.ExerciseWhereInput | undefined,
		skip: number,
		take: number,
	): Promise<ExerciseRaw[]>;
	countExercises(userId: string, filter?: Prisma.ExerciseWhereInput): Promise<number>;
	upsertExercise(
		exercise: Pick<ExerciseUI, "id" | "name" | "muscles" | "imageUrl">,
		userId: string,
	): Promise<void>;
	deleteExercise(id: string, userId: string): Promise<void>;
	hasOwnedProgram(programId: string, userId: string): Promise<boolean>;
	reorderProgramExercises(programId: string, exerciseIds: string[]): Promise<void>;
}

const prismaExerciseRepository: ExerciseRepository = {
	async countExercises(userId, filter) {
		return prisma.exercise.count({
			where: {
				...exerciseLibraryWhere(userId),
				...filter,
			},
		});
	},
	async findExercises(userId, filter, skip, take) {
		return prisma.exercise.findMany({
			where: {
				...exerciseLibraryWhere(userId),
				...filter,
			},
			...exerciseUIArgs,
			orderBy: { name: "asc" },
			skip,
			take,
		});
	},
	async upsertExercise({ id, name, muscles, imageUrl }, userId) {
		await prisma.exercise.upsert({
			where: { id: id || "new-id", userId },
			update: { name, muscles, imageUrl },
			create: { id, name, muscles, imageUrl, userId },
		});
	},
	async deleteExercise(id, userId) {
		await prisma.exercise.delete({ where: { id, userId } });
	},
	async hasOwnedProgram(programId, userId) {
		const program = await prisma.program.findFirst({
			where: { id: programId, userId },
			select: { id: true },
		});
		return !!program;
	},
	async reorderProgramExercises(programId, exerciseIds) {
		await prisma.$transaction(
			exerciseIds.map((exerciseId, index) =>
				prisma.programToExercise.update({
					where: { programId_exerciseId: { programId, exerciseId } },
					data: { order: index },
				}),
			),
		);
	},
};

export function createExerciseService(repository: ExerciseRepository) {
	return {
		async getExercisesSearch(
			userId: string,
			{ search, muscles, page = 1, pageSize = PAGE_SIZE }: ExerciseSearchParams,
		) {
			const searchWords = search?.trim().split(/\s+/).filter(Boolean) || [];

			const andFilters: Prisma.ExerciseWhereInput[] = searchWords.map((word) => ({
				name: { contains: word, mode: "insensitive" as Prisma.QueryMode },
			}));

			if (muscles?.length) {
				andFilters.push({ muscles: { hasSome: muscles } });
			}

			const filter: Prisma.ExerciseWhereInput = andFilters.length ? { AND: andFilters } : {};
			return this.getExercises(userId, filter, page, pageSize);
		},

		async getExercises(
			userId: string,
			filter?: Prisma.ExerciseWhereInput,
			page: number = 1,
			pageSize: number = PAGE_SIZE,
		): Promise<ExerciseUI[]> {
			await devDelay();
			const skip = (page - 1) * pageSize;
			const exercises = await repository.findExercises(userId, filter, skip, pageSize);
			return exercises.map(mapExerciseToUI);
		},

		async countExerciseLibrary(userId: string): Promise<number> {
			return repository.countExercises(userId);
		},

		async saveExercise({ id, name, muscles, imageUrl }: ExerciseUI, userId: string) {
			try {
				await repository.upsertExercise({ id, name, muscles, imageUrl }, userId);
			} catch (error) {
				logError(error, "saveExercise", { extra: { id, name, muscles, imageUrl, userId } });
				throw new Error("Failed to save exercise");
			}
		},

		async deleteExercise(id: string, userId: string) {
			try {
				await repository.deleteExercise(id, userId);
			} catch (error) {
				logError(error, "deleteExercise", { extra: { id, userId } });
				throw new Error("Deletion failed");
			}
		},

		async reorderProgramExercises(programId: string, exerciseIds: string[], userId: string) {
			try {
				const hasProgram = await repository.hasOwnedProgram(programId, userId);
				if (!hasProgram) {
					throw new Error("Program not found or not owned by user");
				}

				await repository.reorderProgramExercises(programId, exerciseIds);
			} catch (error) {
				logError(error, "reorderProgramExercises", { extra: { programId, exerciseIds, userId } });
				throw new Error("Failed to reorder program exercises");
			}
		},
	};
}

const exerciseService = createExerciseService(prismaExerciseRepository);

export const getExercisesSearch = exerciseService.getExercisesSearch.bind(exerciseService);
export const getExercises = exerciseService.getExercises.bind(exerciseService);
export const countExerciseLibrary = exerciseService.countExerciseLibrary.bind(exerciseService);
export const saveExercise = exerciseService.saveExercise;
export const deleteExercise = exerciseService.deleteExercise;
export const reorderProgramExercises = exerciseService.reorderProgramExercises;
