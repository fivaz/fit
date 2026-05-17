import { apiFetch } from "@/lib/api-client";
import { HomeRecentWorkoutUI, ProgressStatsUI, ProgressWorkoutLogUI } from "@/lib/progress/type";

export function getProgressStats(from: Date, to: Date) {
	const params = new URLSearchParams({
		from: from.toISOString(),
		to: to.toISOString(),
	});

	return apiFetch<ProgressStatsUI>(`/api/progress/stats?${params.toString()}`);
}

export function getProgressWorkoutLogs(from: Date, to: Date) {
	const params = new URLSearchParams({
		from: from.toISOString(),
		to: to.toISOString(),
	});

	return apiFetch<ProgressWorkoutLogUI[]>(`/api/progress/logs?${params.toString()}`);
}

export function getHomeRecentWorkouts(limit: number) {
	const params = new URLSearchParams({
		limit: String(limit),
	});

	return apiFetch<HomeRecentWorkoutUI[]>(`/api/home/recent-workouts?${params.toString()}`);
}
