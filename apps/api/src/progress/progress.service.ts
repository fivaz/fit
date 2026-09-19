import type {
	HomeRecentWorkoutUI,
	ProgramProgressUI,
	ProgressStatsUI,
	ProgressWorkoutLogUI,
} from "@fit/shared";

import { ApiError } from "@/api-error";
import { prisma } from "@/prisma/client";
import {
	calculateProgressStats,
	calculateWorkoutDurationMinutes,
	calculateWorkoutVolume,
	countExercisesWithCompletedSets,
} from "@/progress/calculate-stats";
import { buildExerciseProgress } from "@/progress/exercise-progress";

export async function getProgressStats(
	userId: string,
	from: Date,
	to: Date,
): Promise<ProgressStatsUI> {
	const workouts = await prisma.workout.findMany({
		where: {
			userId,
			endDate: { not: null, gte: from, lte: to },
		},
		select: {
			startDate: true,
			endDate: true,
			exercises: {
				select: {
					sets: {
						select: {
							reps: true,
							weight: true,
							time: true,
						},
					},
				},
			},
		},
	});

	return calculateProgressStats(
		workouts.map((workout) => ({
			startDate: workout.startDate,
			endDate: workout.endDate,
			sets: workout.exercises.flatMap((exercise) => exercise.sets),
		})),
	);
}

export async function getProgressWorkoutLogs(
	userId: string,
	from: Date,
	to: Date,
): Promise<ProgressWorkoutLogUI[]> {
	const workouts = await prisma.workout.findMany({
		where: {
			userId,
			endDate: { not: null, gte: from, lte: to },
		},
		orderBy: { startDate: "desc" },
		select: {
			id: true,
			startDate: true,
			endDate: true,
			program: { select: { name: true } },
			exercises: {
				select: {
					sets: {
						select: {
							reps: true,
							weight: true,
							time: true,
						},
					},
				},
			},
		},
	});

	return workouts.map((workout) => {
		const endDate = workout.endDate!;
		const sets = workout.exercises.flatMap((exercise) => exercise.sets);

		return {
			id: workout.id,
			startDate: workout.startDate.toISOString(),
			endDate: endDate.toISOString(),
			programName: workout.program?.name ?? "Workout",
			exerciseCount: countExercisesWithCompletedSets(workout.exercises),
			durationMinutes: Math.round(calculateWorkoutDurationMinutes(workout.startDate, endDate)),
			volume: Math.round(calculateWorkoutVolume(sets)),
		};
	});
}

export async function getRecentWorkoutsForHome(
	userId: string,
	limit: number,
): Promise<HomeRecentWorkoutUI[]> {
	const workouts = await prisma.workout.findMany({
		where: {
			userId,
			endDate: { not: null },
		},
		orderBy: { endDate: "desc" },
		take: limit,
		select: {
			id: true,
			programId: true,
			startDate: true,
			endDate: true,
			program: {
				select: {
					name: true,
					muscles: true,
					imageUrl: true,
				},
			},
			exercises: {
				select: {
					sets: {
						select: {
							reps: true,
							weight: true,
							time: true,
						},
					},
				},
			},
		},
	});

	return workouts.map((workout) => {
		const endDate = workout.endDate!;
		const sets = workout.exercises.flatMap((exercise) => exercise.sets);

		return {
			id: workout.id,
			programId: workout.programId,
			endDate: endDate.toISOString(),
			programName: workout.program?.name ?? "Workout",
			exerciseCount: workout.exercises.length,
			durationMinutes: Math.round(calculateWorkoutDurationMinutes(workout.startDate, endDate)),
			volume: Math.round(calculateWorkoutVolume(sets)),
			programMuscles: workout.program?.muscles ?? [],
			programImageUrl: workout.program?.imageUrl ?? null,
		};
	});
}

export async function getProgramExerciseProgress(
	userId: string,
	programId: string,
): Promise<ProgramProgressUI> {
	const program = await prisma.program.findFirst({
		where: { id: programId, userId },
		select: {
			name: true,
			exercises: {
				orderBy: { order: "asc" },
				select: { exercise: { select: { id: true, name: true } } },
			},
		},
	});

	if (!program) throw new ApiError("Program not found", 404);

	const exercises = program.exercises.map(({ exercise }) => exercise);

	const workoutExercises = await prisma.workoutExercise.findMany({
		where: {
			exerciseId: { in: exercises.map(({ id }) => id) },
			workout: { userId, endDate: { not: null } },
		},
		select: {
			exerciseId: true,
			workout: { select: { id: true, endDate: true } },
			sets: { select: { reps: true, weight: true, time: true, isWarmup: true } },
		},
	});

	return {
		programName: program.name,
		exercises: buildExerciseProgress(
			exercises,
			workoutExercises.map((entry) => ({
				exerciseId: entry.exerciseId,
				workoutId: entry.workout.id,
				endDate: entry.workout.endDate!,
				sets: entry.sets,
			})),
		),
	};
}
