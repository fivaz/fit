import { isCompletedSet } from "@/lib/workout/exercise-progress";
import { SetUI, WorkoutWithMappedSets } from "@/lib/workout/type";

export type CompletedWorkoutSetEntry = {
	set: SetUI;
	setNumber: number;
	exerciseId: string;
	exerciseName: string;
	exerciseImageUrl: string | null;
};

/** Fully logged sets flattened and sorted by completion time (earliest first). */
export function getCompletedSetsInOrder(
	workout: WorkoutWithMappedSets,
): CompletedWorkoutSetEntry[] {
	const entries: CompletedWorkoutSetEntry[] = [];

	for (const exercise of workout.exercises) {
		const sets = workout.exerciseSets[exercise.id] ?? [];
		sets.forEach((set, index) => {
			if (!isCompletedSet(set)) return;
			entries.push({
				set,
				setNumber: index + 1,
				exerciseId: exercise.id,
				exerciseName: exercise.exercise.name,
				exerciseImageUrl: exercise.exercise.imageUrl,
			});
		});
	}

	return entries.sort((a, b) => new Date(a.set.time!).getTime() - new Date(b.set.time!).getTime());
}
