import type { ExerciseUI } from "./exercise.js";
import type { MuscleGroupType } from "./muscle.js";

export type SetUI = {
	id: string;
	order: number;
	reps: number;
	weight: number | null;
	time: Date | null;
	isWarmup: boolean;
};

export type WorkoutSetMap = Record<string, SetUI[]>;

export type WorkoutProgramSnapshot = {
	name: string;
	imageUrl: string | null;
	muscles: MuscleGroupType[];
};

export type WorkoutExerciseUI = {
	id: string;
	order: number;
	exercise: ExerciseUI;
};

export type WorkoutWithMappedSets = {
	id: string;
	startDate: Date | string;
	endDate: Date | string | null;
	program: WorkoutProgramSnapshot | null;
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
