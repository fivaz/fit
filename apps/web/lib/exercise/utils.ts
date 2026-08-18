import { ExerciseRaw, ExerciseUI } from "@/lib/exercise/type";

export function mapExerciseToUI(exercise: ExerciseRaw): ExerciseUI {
	const { userId, ...rest } = exercise;
	return {
		...rest,
		isPrivate: userId !== null,
	};
}
