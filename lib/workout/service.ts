import { revalidatePath } from "next/cache";

import { ROUTES } from "@/lib/consts";
import { mapExerciseToUI } from "@/lib/exercise/utils";
import { logError } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { devDelay } from "@/lib/utils";
import {
	SetUI,
	WorkoutSetMap,
	workoutWithExercisesAndSets,
	WorkoutWithMappedSets,
} from "@/lib/workout/type";

import "server-only";

export async function syncWorkoutSets(
	workoutId: string,
	exerciseSetsMap: WorkoutSetMap,
	userId: string,
) {
	await devDelay();

	const workout = await prisma.workout.findFirst({
		where: { id: workoutId, userId },
		select: { id: true },
	});

	if (!workout) {
		throw new Error("Workout not found");
	}

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

	await prisma.$transaction(async (tx) => {
		await tx.set.deleteMany({
			where: { workoutExercise: { workoutId, workout: { userId } } },
		});

		if (allSets.length > 0) {
			await tx.set.createMany({ data: allSets });
		}
	});

	revalidatePath(`${ROUTES.WORKOUT}/${workoutId}`);

	return exerciseSetsMap;
}

export async function getWorkoutById(
	id: string,
	userId: string,
): Promise<WorkoutWithMappedSets | null> {
	const workout = await prisma.workout.findUnique({
		where: { id, userId },
		...workoutWithExercisesAndSets,
	});

	if (!workout) return null;

	const exerciseSets: WorkoutSetMap = {};

	const exercisesUI = workout.exercises.map(({ id, sets, exercise, ...rest }) => {
		exerciseSets[id] = sets;

		return {
			...rest,
			id,
			exercise: mapExerciseToUI(exercise),
		};
	});

	return {
		...workout,
		exercises: exercisesUI,
		exerciseSets,
	};
}

export async function startWorkout(programId: string, userId: string): Promise<string> {
	const program = await prisma.program.findFirst({
		where: { id: programId, userId },
		include: { exercises: { orderBy: { order: "asc" } } },
	});

	if (!program) throw new Error("Program not found");

	const exercisesToCreate = await Promise.all(
		program.exercises.map(async (programExercise) => {
			const seedSets = await getSeedSetsForExercise(userId, programId, programExercise.exerciseId);

			return {
				exerciseId: programExercise.exerciseId,
				order: programExercise.order,
				sets: {
					create: formatSetsForNewWorkout(seedSets),
				},
			};
		}),
	);

	const newWorkout = await prisma.workout.create({
		data: {
			userId,
			programId,
			startDate: new Date(),
			exercises: { create: exercisesToCreate },
		},
	});

	return newWorkout.id;
}

async function getSeedSetsForExercise(
	userId: string,
	programId: string,
	exerciseId: string,
): Promise<SetUI[]> {
	const lastProgramWorkout = await prisma.workout.findFirst({
		where: { userId, programId, endDate: { not: null } },
		orderBy: { startDate: "desc" },
		include: {
			exercises: {
				where: { exerciseId },
				include: { sets: { orderBy: { order: "asc" } } },
			},
		},
	});

	const matchingExercise = lastProgramWorkout?.exercises.find(
		(exercise) => exercise.exerciseId === exerciseId,
	);

	if (matchingExercise && matchingExercise.sets.length > 0) {
		return matchingExercise.sets;
	}

	const oldestExerciseRecord = await prisma.set.findFirst({
		where: {
			workoutExercise: {
				exerciseId,
				workout: { userId, endDate: { not: null } },
			},
		},
		orderBy: { time: "asc" },
		select: {
			workoutExercise: {
				include: { sets: { orderBy: { order: "asc" } } },
			},
		},
	});

	return oldestExerciseRecord?.workoutExercise.sets || [];
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

export async function finishWorkout(workoutId: string, userId: string) {
	try {
		await prisma.workout.update({
			where: { id: workoutId, userId },
			data: {
				endDate: new Date(),
			},
		});
	} catch (error) {
		logError(error, "finishWorkout", { extra: { workoutId, userId } });
		throw new Error("Could not complete workout");
	}

	revalidatePath(ROUTES.PROGRESS);
}

export async function getActiveWorkout(userId: string) {
	return prisma.workout.findFirst({
		where: {
			userId,
			endDate: null,
		},
		select: { id: true },
	});
}
