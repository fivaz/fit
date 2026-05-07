import { offlineDataAdapters } from "@/lib/offline/data-adapters";
import { WorkoutSetMap, WorkoutWithMappedSets } from "@/lib/workout/type";

export function getActiveWorkout() {
	return offlineDataAdapters.getActiveWorkout();
}

export function getWorkoutById(workoutId: string): Promise<WorkoutWithMappedSets | null> {
	return offlineDataAdapters.getWorkoutById(workoutId);
}

export function syncWorkoutSets(workoutId: string, exerciseSetsMap: WorkoutSetMap) {
	return offlineDataAdapters.syncWorkoutSets(workoutId, exerciseSetsMap);
}

export function startWorkout(programId: string) {
	return offlineDataAdapters.startWorkout(programId);
}

export function finishWorkout(workoutId: string) {
	return offlineDataAdapters.finishWorkout(workoutId);
}
