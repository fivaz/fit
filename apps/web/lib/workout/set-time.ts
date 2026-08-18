import { SetUI, WorkoutSetMap } from "@/lib/workout/type";

export function getLatestSetTimeFromSets(sets: ReadonlyArray<Pick<SetUI, "time">>): Date | null {
	let latest: Date | null = null;

	for (const set of sets) {
		if (set.time == null) continue;
		const time = new Date(set.time);
		if (Number.isNaN(time.getTime())) continue;
		if (latest === null || time.getTime() > latest.getTime()) {
			latest = time;
		}
	}

	return latest;
}

export function getLatestSetTimeFromWorkoutSets(exerciseSets: WorkoutSetMap): Date | null {
	return getLatestSetTimeFromSets(Object.values(exerciseSets).flat());
}
