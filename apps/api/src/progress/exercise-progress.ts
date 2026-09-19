import type { ExerciseProgressSessionUI, ProgramExerciseProgressUI } from "@fit/shared";

export type SetForExerciseProgress = {
	reps: number;
	weight: number | null;
	time: Date | null;
	isWarmup: boolean;
};

export type ExerciseSessionEntry = {
	exerciseId: string;
	workoutId: string;
	endDate: Date;
	sets: SetForExerciseProgress[];
};

/** Working sets that were actually logged: reps and a completion time, warm-ups excluded. */
function isLoggedWorkingSet(set: SetForExerciseProgress): boolean {
	return !set.isWarmup && set.reps > 0 && set.time !== null;
}

export function buildExerciseProgress(
	exercises: Array<{ id: string; name: string }>,
	entries: ExerciseSessionEntry[],
): ProgramExerciseProgressUI[] {
	return exercises.map((exercise) => {
		const sessions = entries
			.filter((entry) => entry.exerciseId === exercise.id)
			.sort((a, b) => a.endDate.getTime() - b.endDate.getTime())
			.flatMap((entry): ExerciseProgressSessionUI[] => {
				const logged = entry.sets.filter(isLoggedWorkingSet);
				if (logged.length === 0) return [];

				return [
					{
						workoutId: entry.workoutId,
						date: entry.endDate.toISOString(),
						maxWeight: Math.max(...logged.map((set) => set.weight ?? 0)),
						maxReps: Math.max(...logged.map((set) => set.reps)),
						volume: Math.round(logged.reduce((sum, set) => sum + (set.weight ?? 0) * set.reps, 0)),
					},
				];
			});

		return { exerciseId: exercise.id, name: exercise.name, sessions };
	});
}
