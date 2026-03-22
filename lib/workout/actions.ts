"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/consts";
import { mapExerciseToUI } from "@/lib/exercise/utils";
import { logError } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { devDelay } from "@/lib/utils";
import { getUserId } from "@/lib/utils-server";
import { SetUI, WorkoutSetMap, workoutWithExercisesAndSets } from "@/lib/workout/type";

export async function syncWorkoutSetsAction(workoutId: string, exerciseSetsMap: WorkoutSetMap) {
	await devDelay();
	// 1. Flatten the map into an array compatible with createMany
	const allSets = Object.entries(exerciseSetsMap).flatMap(([workoutExerciseId, sets]) =>
		sets.map((set, index) => ({
			id: set.id, // Using the client-generated UUID
			reps: set.reps,
			weight: set.weight,
			time: set.time,
			isWarmup: set.isWarmup,
			order: index,
			workoutExerciseId,
		})),
	);

	await prisma.$transaction(async (tx) => {
		// 2. Wipe all existing sets for this workout
		await tx.set.deleteMany({
			where: { workoutExercise: { workoutId: workoutId } },
		});

		// 3. Bulk insert everything from the client
		if (allSets.length > 0) {
			await tx.set.createMany({ data: allSets });
		}
	});

	revalidatePath(`${ROUTES.WORKOUT}/${workoutId}`);

	return exerciseSetsMap;
}

/**
 * Fetches a complete workout session including the program details,
 * all exercises performed, and the individual sets for each exercise.
 */
export async function getWorkoutByIdAction(id: string) {
	const userId = await getUserId();

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

export type WorkoutWithMappedSets = NonNullable<Awaited<ReturnType<typeof getWorkoutByIdAction>>>;

export async function handleStartWorkoutAction(programId: string) {
	await devDelay();

	const workoutId = await startWorkoutAction(programId);

	redirect(`${ROUTES.WORKOUT}/${workoutId}`);
}

/**
 * Coordinates the creation of a new workout session.
 * @returns The ID of the newly created workout.
 */
export async function startWorkoutAction(programId: string): Promise<string> {
	const userId = await getUserId();

	// 1. Fetch the Program structure
	const program = await prisma.program.findUnique({
		where: { id: programId },
		include: { exercises: { orderBy: { order: "asc" } } },
	});

	if (!program) throw new Error("Program not found");

	// 2. Resolve data for each exercise in the program
	const exercisesToCreate = await Promise.all(
		program.exercises.map(async (pEx) => {
			const seedSets = await getSeedSetsForExercise(userId, programId, pEx.exerciseId);

			return {
				exerciseId: pEx.exerciseId,
				order: pEx.order,
				sets: {
					create: formatSetsForNewWorkout(seedSets),
				},
			};
		}),
	);

	// 3. Persist the new workout
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

/**
 * FUNCTION B: DATA RESOLVER
 * Finds historical sets to pre-fill the new workout.
 * Logic: Recent Program History -> Oldest Global History (via 'time' column).
 * @returns An array of Sets or an empty array if no history exists.
 */
async function getSeedSetsForExercise(
	userId: string,
	programId: string,
	exerciseId: string,
): Promise<SetUI[]> {
	// Step 1: Look for the most recent session of THIS specific program
	const lastProgramWorkout = await prisma.workout.findFirst({
		// endDate: {not: null} - Only consider finished workouts
		where: { userId, programId, endDate: { not: null } },
		orderBy: { startDate: "desc" },
		include: {
			exercises: {
				where: { exerciseId },
				include: { sets: { orderBy: { order: "asc" } } },
			},
		},
	});

	const matchingExercise = lastProgramWorkout?.exercises.find((e) => e.exerciseId === exerciseId);

	if (matchingExercise && matchingExercise.sets.length > 0) {
		return matchingExercise.sets;
	}

	// Step 2: Fallback - Find the OLDEST sets ever recorded for this exercise
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

/**
 * Maps raw DB sets to the nested 'create' structure for Prisma.
 * @returns Array of data objects for Prisma's 'create' input.
 */
function formatSetsForNewWorkout(sets: SetUI[]): Array<{
	order: number;
	reps: number;
	weight: number | null;
	isWarmup: boolean;
	time: null;
}> {
	// If no history exists, provide default empty sets
	if (sets.length === 0) {
		return [0, 1, 2].map((i) => ({
			order: i,
			reps: 0,
			weight: null,
			isWarmup: false,
			time: null,
		}));
	}

	// Otherwise, map the historical data (resetting the 'time' for the new session)
	return sets.map((s, index) => ({
		order: index,
		reps: s.reps,
		weight: s.weight,
		isWarmup: s.isWarmup,
		time: null,
	}));
}

export async function finishWorkoutAction(workoutId: string) {
	try {
		await prisma.workout.update({
			where: { id: workoutId },
			data: {
				endDate: new Date(),
			},
		});
	} catch (error) {
		logError(error, "finishWorkout", { extra: { workoutId } });
		throw new Error("Could not complete workout");
	}

	revalidatePath(ROUTES.PROGRESS);
}

export async function redirectToActiveWorkoutAction() {
	const userId = await getUserId();

	const activeWorkout = await prisma.workout.findFirst({
		where: {
			userId,
			endDate: null,
		},
		select: { id: true },
	});

	if (activeWorkout) {
		redirect(`${ROUTES.WORKOUT}/${activeWorkout.id}`);
	}

	return null;
}
