import { fetchAfterPendingWrites } from "@/lib/offline/data-adapters";
import {
	HomeRecentWorkoutUI,
	ProgramProgressUI,
	ProgressStatsUI,
	ProgressWorkoutLogUI,
} from "@/lib/progress/type";

export function getProgressStats(from: Date, to: Date) {
	const params = new URLSearchParams({
		from: from.toISOString(),
		to: to.toISOString(),
	});

	return fetchAfterPendingWrites<ProgressStatsUI>(`/api/progress/stats?${params.toString()}`);
}

export function getProgressWorkoutLogs(from: Date, to: Date) {
	const params = new URLSearchParams({
		from: from.toISOString(),
		to: to.toISOString(),
	});

	return fetchAfterPendingWrites<ProgressWorkoutLogUI[]>(`/api/progress/logs?${params.toString()}`);
}

export function getHomeRecentWorkouts(limit: number) {
	const params = new URLSearchParams({
		limit: String(limit),
	});

	return fetchAfterPendingWrites<HomeRecentWorkoutUI[]>(
		`/api/home/recent-workouts?${params.toString()}`,
	);
}

export function getProgramProgress(programId: string) {
	return fetchAfterPendingWrites<ProgramProgressUI>(
		`/api/progress/programs/${encodeURIComponent(programId)}/exercises`,
	);
}
