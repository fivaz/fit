import { revalidatePath } from "next/cache";

import { ROUTES } from "@/lib/consts";
import { mapExerciseToUI } from "@/lib/exercise/utils";
import { logError } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { devDelay } from "@/lib/utils";
import {
	SetUI,
	WorkoutSetMap,
	WorkoutWithExercises,
	workoutWithExercisesAndSets,
	WorkoutWithMappedSets,
} from "@/lib/workout/type";

import "server-only";

type WorkoutSetsInsert = {
	id: string;
	reps: number;
	weight: number | null;
	time: Date | null;
	isWarmup: boolean;
	order: number;
	workoutExerciseId: string;
};

export interface WorkoutRepository {
	hasOwnedWorkout(workoutId: string, userId: string): Promise<boolean>;
	replaceWorkoutSets(workoutId: string, userId: string, sets: WorkoutSetsInsert[]): Promise<void>;
	getWorkoutById(id: string, userId: string): Promise<WorkoutWithExercises | null>;
	getProgramWithExercises(
		programId: string,
		userId: string,
	): Promise<{
		exercises: Array<{ exerciseId: string; order: number }>;
	} | null>;
	getLastProgramExerciseSets(
		userId: string,
		programId: string,
		exerciseId: string,
	): Promise<SetUI[]>;
	getOldestExerciseSets(userId: string, exerciseId: string): Promise<SetUI[]>;
	createWorkout(
		userId: string,
		programId: string,
		exercises: Array<{ exerciseId: string; order: number; sets: SetUI[] }>,
	): Promise<string>;
	finishWorkout(workoutId: string, userId: string): Promise<void>;
	getActiveWorkout(userId: string): Promise<{ id: string } | null>;
}

const prismaWorkoutRepository: WorkoutRepository = {
	async hasOwnedWorkout(workoutId, userId) {
		const workout = await prisma.workout.findFirst({
			where: { id: workoutId, userId },
			select: { id: true },
		});
		return !!workout;
	},
	async replaceWorkoutSets(workoutId, userId, sets) {
		await prisma.$transaction(async (tx) => {
			await tx.set.deleteMany({ where: { workoutExercise: { workoutId, workout: { userId } } } });
			if (sets.length > 0) {
				await tx.set.createMany({ data: sets });
			}
		});
	},
	async getWorkoutById(id, userId) {
		return prisma.workout.findUnique({ where: { id, userId }, ...workoutWithExercisesAndSets });
	},
	async getProgramWithExercises(programId, userId) {
		return prisma.program.findFirst({
			where: { id: programId, userId },
			include: { exercises: { orderBy: { order: "asc" } } },
		});
	},
	async getLastProgramExerciseSets(userId, programId, exerciseId) {
		const lastProgramWorkout = await prisma.workout.findFirst({
			where: { userId, programId, endDate: { not: null } },
			orderBy: { startDate: "desc" },
			include: {
				exercises: { where: { exerciseId }, include: { sets: { orderBy: { order: "asc" } } } },
			},
		});
		const matchingExercise = lastProgramWorkout?.exercises.find(
			(exercise) => exercise.exerciseId === exerciseId,
		);
		return matchingExercise?.sets || [];
	},
	async getOldestExerciseSets(userId, exerciseId) {
		const oldestExerciseRecord = await prisma.set.findFirst({
			where: { workoutExercise: { exerciseId, workout: { userId, endDate: { not: null } } } },
			orderBy: { time: "asc" },
			select: { workoutExercise: { include: { sets: { orderBy: { order: "asc" } } } } },
		});
		return oldestExerciseRecord?.workoutExercise.sets || [];
	},
	async createWorkout(userId, programId, exercises) {
		const newWorkout = await prisma.workout.create({
			data: {
				userId,
				programId,
				startDate: new Date(),
				exercises: {
					create: exercises.map((exercise) => ({
						exerciseId: exercise.exerciseId,
						order: exercise.order,
						sets: { create: formatSetsForNewWorkout(exercise.sets) },
					})),
				},
			},
		});
		return newWorkout.id;
	},
	async finishWorkout(workoutId, userId) {
		const lastSet = await prisma.set.findFirst({
			where: {
				time: { not: null },
				workoutExercise: { workoutId, workout: { userId } },
			},
			orderBy: { time: "desc" },
			select: { time: true },
		});

		await prisma.workout.update({
			where: { id: workoutId, userId },
			data: { endDate: lastSet?.time ?? new Date() },
		});
	},
	async getActiveWorkout(userId) {
		return prisma.workout.findFirst({ where: { userId, endDate: null }, select: { id: true } });
	},
};

export function createWorkoutService(repository: WorkoutRepository) {
	return {
		async syncWorkoutSets(workoutId: string, exerciseSetsMap: WorkoutSetMap, userId: string) {
			await devDelay();
			const hasWorkout = await repository.hasOwnedWorkout(workoutId, userId);
			if (!hasWorkout) throw new Error("Workout not found");

			const allSets = Object.entries(exerciseSetsMap).flatMap(([workoutExerciseId, sets]) =>
				sets.map((set, index) => ({
					id: set.id,
					reps: set.reps,
					weight: set.weight,
					time: set.time ? new Date(set.time) : null,
					isWarmup: set.isWarmup,
					order: index,
					workoutExerciseId,
				})),
			);

			await repository.replaceWorkoutSets(workoutId, userId, allSets);
			revalidatePath(ROUTES.HOME);
			return exerciseSetsMap;
		},

		async getWorkoutById(id: string, userId: string): Promise<WorkoutWithMappedSets | null> {
			const workout = await repository.getWorkoutById(id, userId);
			if (!workout) return null;

			const exerciseSets: WorkoutSetMap = {};
			const exercisesUI = workout.exercises.map(
				({ id: workoutExerciseId, sets, exercise, ...rest }) => {
					exerciseSets[workoutExerciseId] = sets;
					return { ...rest, id: workoutExerciseId, exercise: mapExerciseToUI(exercise) };
				},
			);

			return { ...workout, exercises: exercisesUI, exerciseSets };
		},

		async startWorkout(programId: string, userId: string): Promise<string> {
			const program = await repository.getProgramWithExercises(programId, userId);
			if (!program) throw new Error("Program not found");

			const exercisesToCreate = await Promise.all(
				program.exercises.map(async (programExercise) => ({
					exerciseId: programExercise.exerciseId,
					order: programExercise.order,
					sets: await getSeedSetsForExercise(
						repository,
						userId,
						programId,
						programExercise.exerciseId,
					),
				})),
			);

			return repository.createWorkout(userId, programId, exercisesToCreate);
		},

		async finishWorkout(workoutId: string, userId: string) {
			try {
				await repository.finishWorkout(workoutId, userId);
			} catch (error) {
				logError(error, "finishWorkout", { extra: { workoutId, userId } });
				throw new Error("Could not complete workout");
			}
			revalidatePath(ROUTES.PROGRESS);
		},

		async getActiveWorkout(userId: string) {
			return repository.getActiveWorkout(userId);
		},
	};
}

async function getSeedSetsForExercise(
	repository: WorkoutRepository,
	userId: string,
	programId: string,
	exerciseId: string,
): Promise<SetUI[]> {
	const lastProgramSets = await repository.getLastProgramExerciseSets(
		userId,
		programId,
		exerciseId,
	);
	if (lastProgramSets.length > 0) {
		return lastProgramSets;
	}
	return repository.getOldestExerciseSets(userId, exerciseId);
}

function formatSetsForNewWorkout(sets: SetUI[]): Array<{
	order: number;
	reps: number;
	weight: number | null;
	isWarmup: boolean;
	time: null;
}> {
	if (sets.length === 0) {
		return [0, 1, 2].map((order) => ({
			order,
			reps: 0,
			weight: null,
			isWarmup: false,
			time: null,
		}));
	}

	return sets.map((set, index) => ({
		order: index,
		reps: set.reps,
		weight: set.weight,
		isWarmup: set.isWarmup,
		time: null,
	}));
}

const workoutService = createWorkoutService(prismaWorkoutRepository);

export const syncWorkoutSets = workoutService.syncWorkoutSets;
export const getWorkoutById = workoutService.getWorkoutById;
export const startWorkout = workoutService.startWorkout;
export const finishWorkout = workoutService.finishWorkout;
export const getActiveWorkout = workoutService.getActiveWorkout;
