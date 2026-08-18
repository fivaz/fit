import type { ExerciseUI } from "./exercise.js";
import type { MuscleGroupType } from "./muscle.js";

export type ProgramUI = {
	id: string;
	name: string;
	muscles: MuscleGroupType[];
	imageUrl: string | null;
	order: number;
	groupId: string | null;
};

export type OrderedExercise = ExerciseUI & { order: number };

export type ProgramWithExercises = ProgramUI & {
	exercises: OrderedExercise[];
};

export function buildEmptyProgram(): ProgramUI {
	return {
		id: "",
		name: "",
		muscles: [],
		order: 0,
		imageUrl: null,
		groupId: null,
	};
}
