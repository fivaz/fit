export type Trend = "up" | "down" | "equal";

export function getTrend(current: number, previous: number): Trend {
	if (current > previous) return "up";
	if (current < previous) return "down";
	return "equal";
}
