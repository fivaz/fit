import { type BodyMetricsUI,getEmptyBodyMetrics } from "@fit/shared";

export { type BodyMetricsUI,getEmptyBodyMetrics };

export function formToBodyMetric(formData: FormData): BodyMetricsUI {
	const id = formData.get("id") as string;
	const weightRaw = formData.get("weight") as string;
	const bodyFatRaw = formData.get("bodyFat") as string;
	const muscleMassRaw = formData.get("muscleMass") as string;
	const visceralFatRaw = formData.get("visceralFat") as string;

	return {
		id,
		weight: weightRaw ? parseFloat(weightRaw) : null,
		bodyFat: bodyFatRaw ? parseFloat(bodyFatRaw) : null,
		muscleMass: muscleMassRaw ? parseFloat(muscleMassRaw) : null,
		visceralFat: visceralFatRaw ? parseInt(visceralFatRaw, 10) : null,
	};
}
