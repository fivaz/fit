import { apiFetch } from "@/lib/api-client";
import { ProgressStatsUI, ProgressWorkoutLogUI } from "@/lib/progress/type";

export function getProgressStats() {
	return apiFetch<ProgressStatsUI>("/api/progress/stats");
}

export function getProgressWorkoutLogs(from: Date, to: Date) {
	const params = new URLSearchParams({
		from: from.toISOString(),
		to: to.toISOString(),
	});

	return apiFetch<ProgressWorkoutLogUI[]>(`/api/progress/logs?${params.toString()}`);
}
