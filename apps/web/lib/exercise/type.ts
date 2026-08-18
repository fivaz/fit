import {
	buildEmptyExercise,
	type ExerciseRaw,
	type ExerciseUI,
	type MuscleGroupType,
} from "@fit/shared";

export { buildEmptyExercise, type ExerciseRaw, type ExerciseUI };

export function formToExercise(formData: FormData): ExerciseUI {
	return {
		id: (formData.get("id") as string) || "",
		name: (formData.get("name") as string) || "",
		muscles: formData.getAll("muscles") as MuscleGroupType[],
		imageUrl: null,
		isPrivate: true,
		instructions: [],
	};
}
