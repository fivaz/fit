import type { ProgressStatsUI } from "@fit/shared";

export type SetForStats = {
	reps: number;
	weight: number | null;
	time: Date | null;
};

export type WorkoutForStats = {
	startDate: Date;
	endDate: Date | null;
	sets: SetForStats[];
};

function isCompletedSet(set: Pick<SetForStats, "reps" | "weight" | "time">): boolean {
	return set.reps > 0 && (set.weight ?? 0) > 0 && set.time != null;
}

function average(values: number[]): number {
	if (values.length === 0) return 0;
	return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function calculateWorkoutVolume(sets: Pick<SetForStats, "reps" | "weight" | "time">[]): number {
	return sets.filter(isCompletedSet).reduce((sum, set) => sum + (set.weight ?? 0) * set.reps, 0);
}

export function calculateWorkoutDurationMinutes(startDate: Date, endDate: Date): number {
	return (endDate.getTime() - startDate.getTime()) / 60_000;
}

export function calculateInterSetRestSeconds(sets: SetForStats[]): number[] {
	const times = sets
		.map((set) => set.time)
		.filter((time): time is Date => time !== null)
		.sort((a, b) => a.getTime() - b.getTime());

	const gaps: number[] = [];
	for (let index = 1; index < times.length; index++) {
		gaps.push((times[index].getTime() - times[index - 1].getTime()) / 1000);
	}
	return gaps;
}

export function calculateProgressStats(workouts: WorkoutForStats[]): ProgressStatsUI {
	const finished = workouts.filter(
		(workout): workout is WorkoutForStats & { endDate: Date } => workout.endDate !== null,
	);

	const durations = finished.map((workout) =>
		calculateWorkoutDurationMinutes(workout.startDate, workout.endDate),
	);
	const volumes = finished.map((workout) => calculateWorkoutVolume(workout.sets));
	const restGaps = finished.flatMap((workout) => calculateInterSetRestSeconds(workout.sets));

	return {
		workoutCount: finished.length,
		avgWorkoutMinutes: Math.round(average(durations)),
		avgWorkoutVolume: Math.round(average(volumes)),
		avgRestSeconds: Math.round(average(restGaps)),
	};
}

export function countExercisesWithCompletedSets(
	exercises: ReadonlyArray<{ sets: ReadonlyArray<Pick<SetForStats, "reps" | "weight" | "time">> }>,
): number {
	return exercises.filter((exercise) => exercise.sets.some(isCompletedSet)).length;
}
