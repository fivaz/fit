export type BodyMetricsUI = {
	id: string;
	weight: number | null;
	bodyFat: number | null;
	muscleMass: number | null;
	visceralFat: number | null;
};

export function getEmptyBodyMetrics(): BodyMetricsUI {
	return {
		id: "",
		weight: null,
		bodyFat: null,
		muscleMass: null,
		visceralFat: null,
	};
}
