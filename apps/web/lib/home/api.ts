import { apiFetch } from "@/lib/api-client";

export function getHomeExerciseLibraryCount() {
	return apiFetch<{ count: number }>("/api/home/exercise-count");
}
