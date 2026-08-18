import { BodyMetricsUI } from "@/lib/body-metrics/type";
import { offlineDataAdapters } from "@/lib/offline/data-adapters";

export function getBodyMetrics() {
	return offlineDataAdapters.getBodyMetrics();
}

export function saveBodyMetrics(metrics: BodyMetricsUI) {
	return offlineDataAdapters.saveBodyMetrics(metrics);
}
