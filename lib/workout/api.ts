import { apiFetch } from "@/lib/api-client";
import { WorkoutSetMap } from "@/lib/workout/type";

export function syncWorkoutSets(workoutId: string, exerciseSetsMap: WorkoutSetMap) {
	return apiFetch<WorkoutSetMap>(`/api/workouts/${workoutId}/sets`, {
		method: "PUT",
		body: { exerciseSetsMap },
	});
}

export function startWorkout(programId: string) {
	return apiFetch<{ id: string }>("/api/workouts", {
		method: "POST",
		body: { programId },
	});
}

export function finishWorkout(workoutId: string) {
	return apiFetch<void>(`/api/workouts/${workoutId}/finish`, {
		method: "POST",
	});
}
