import { exerciseUIArgs } from "@/lib/exercise/type";
import { ExerciseUI } from "@/lib/exercise/type";
import { Prisma } from "@/lib/generated/prisma/client";

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

export type SetUI = Prisma.SetGetPayload<typeof setUIArgs>;

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

// The Map type for your sync function
export type WorkoutSetMap = Record<string, SetUI[]>;

type WorkoutExerciseUI = Omit<WorkoutWithExercises["exercises"][number], "exercise" | "sets"> & {
	exercise: ExerciseUI;
};

export type WorkoutWithMappedSets = Omit<WorkoutWithExercises, "exercises"> & {
	exercises: WorkoutExerciseUI[];
	exerciseSets: WorkoutSetMap;
};

export function getEmptySet(order: number): SetUI {
	return {
		id: crypto.randomUUID(),
		reps: 0,
		weight: 0,
		order,
		time: null,
		isWarmup: false,
	};
}
