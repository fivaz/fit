import { exerciseUIArgs } from "@/exercise/select";
import { Prisma } from "@/generated/prisma/client";

export const setUIArgs = {
	select: {
		id: true,
		order: true,
		reps: true,
		weight: true,
		time: true,
		isWarmup: true,
	},
} satisfies Prisma.SetDefaultArgs;

export const workoutWithExercisesAndSets = {
	select: {
		id: true,
		startDate: true,
		endDate: true,
		program: {
			select: {
				name: true,
				imageUrl: true,
				muscles: true,
			},
		},
		exercises: {
			orderBy: {
				order: "asc" as const,
			},
			select: {
				id: true,
				order: true,
				exercise: {
					...exerciseUIArgs,
				},
				sets: {
					orderBy: {
						order: "asc" as const,
					},
					...setUIArgs,
				},
			},
		},
	},
} satisfies Prisma.WorkoutDefaultArgs;

export type WorkoutWithExercises = Prisma.WorkoutGetPayload<typeof workoutWithExercisesAndSets>;
