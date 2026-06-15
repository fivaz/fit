import { SetUI, WorkoutSetMap } from "@/lib/workout/type";

type SetCompletionFields = Pick<SetUI, "reps" | "weight" | "time">;

/** A set is complete when reps, weight, and time are all filled in. */
export function isCompletedSet(set: SetCompletionFields): boolean {
	return set.reps > 0 && (set.weight ?? 0) > 0 && set.time != null;
}

/** A working set counts toward exercise completion when fully logged. */
export function isLoggedWorkingSet(set: SetUI): boolean {
	if (set.isWarmup) return false;
	return isCompletedSet(set);
}

export function isExerciseLogged(exerciseSets: SetUI[] | undefined): boolean {
	return (exerciseSets ?? []).some(isLoggedWorkingSet);
}

export type WorkoutExerciseProgress = {
	total: number;
	done: number;
	left: number;
};

export function getWorkoutExerciseProgress(
	exerciseIds: string[],
	exerciseSets: WorkoutSetMap,
): WorkoutExerciseProgress {
	const total = exerciseIds.length;
	const done = exerciseIds.filter((id) => isExerciseLogged(exerciseSets[id])).length;
	return { total, done, left: Math.max(total - done, 0) };
}

/** Fully logged sets count toward Live Activity set progress. */
export function isLoggedSet(set: SetUI): boolean {
	return isCompletedSet(set);
}

export type WorkoutSetProgress = {
	total: number;
	done: number;
	left: number;
	/** 0–1 fraction for progress UI. */
	progress: number;
};

export function getWorkoutSetProgress(
	exerciseIds: string[],
	exerciseSets: WorkoutSetMap,
): WorkoutSetProgress {
	let total = 0;
	let done = 0;

	for (const exerciseId of exerciseIds) {
		const sets = exerciseSets[exerciseId] ?? [];
		total += sets.length;
		done += sets.filter(isLoggedSet).length;
	}

	const progress = total > 0 ? done / total : 0;
	return { total, done, left: Math.max(total - done, 0), progress };
}
