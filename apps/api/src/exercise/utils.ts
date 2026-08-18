import type { ExerciseRaw, ExerciseUI } from "@fit/shared";

export function mapExerciseToUI(exercise: ExerciseRaw): ExerciseUI {
	const { userId, ...rest } = exercise;
	return {
		...rest,
		isPrivate: userId !== null,
	};
}
