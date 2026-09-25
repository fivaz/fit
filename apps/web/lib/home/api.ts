import { fetchAfterPendingWrites } from "@/lib/offline/data-adapters";

export function getHomeExerciseLibraryCount() {
	return fetchAfterPendingWrites<{ count: number }>("/api/home/exercise-count");
}
