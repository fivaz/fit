import { apiFetch } from "@/lib/api-client";
import { BodyMetricsUI } from "@/lib/body-metrics/type";

export function saveBodyMetrics(metrics: BodyMetricsUI) {
	return apiFetch<void>("/api/body-metrics", {
		method: "PUT",
		body: metrics,
	});
}
