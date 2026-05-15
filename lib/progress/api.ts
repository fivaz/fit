import { apiFetch } from "@/lib/api-client";
import { ProgressStatsUI } from "@/lib/progress/type";

export function getProgressStats() {
	return apiFetch<ProgressStatsUI>("/api/progress/stats");
}
