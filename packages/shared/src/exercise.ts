import type { MuscleGroupType } from "./muscle.js";

export type ExerciseUI = {
	id: string;
	name: string;
	muscles: MuscleGroupType[];
	imageUrl: string | null;
	isPrivate: boolean;
	instructions: string[];
};

export type ExerciseRaw = {
	id: string;
	name: string;
	muscles: MuscleGroupType[];
	imageUrl: string | null;
	userId: string | null;
	instructions: string[];
};

export function buildEmptyExercise(): ExerciseUI {
	return {
		id: "",
		name: "",
		muscles: [],
		imageUrl: null,
		isPrivate: true,
		instructions: [],
	};
}
