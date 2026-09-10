import { formatWorkoutElapsed } from "@/lib/workout/elapsed";
import { getWorkoutExerciseProgress, getWorkoutSetProgress } from "@/lib/workout/exercise-progress";
import { WorkoutSetMap } from "@/lib/workout/type";

export type WorkoutProgressDisplay = {
	programName: string;
	elapsed: string;
	exercisesDone: number;
	exercisesLeft: number;
	setsDone: number;
	setsTotal: number;
	/** 0–1 fraction for progress UI. */
	progress: number;
};

type WorkoutProgressSource = {
	program?: { name?: string | null } | null;
	startDate: Date | string;
	exercises: { id: string }[];
};

export function buildWorkoutProgressDisplay(
	workout: WorkoutProgressSource,
	exerciseSets: WorkoutSetMap,
): WorkoutProgressDisplay {
	const exerciseIds = workout.exercises.map((exercise) => exercise.id);
	const exercises = getWorkoutExerciseProgress(exerciseIds, exerciseSets);
	const sets = getWorkoutSetProgress(exerciseIds, exerciseSets);

	return {
		programName: workout.program?.name ?? "Workout",
		elapsed: formatWorkoutElapsed(workout.startDate),
		exercisesDone: exercises.done,
		exercisesLeft: exercises.left,
		setsDone: sets.done,
		setsTotal: sets.total,
		progress: sets.progress,
	};
}
