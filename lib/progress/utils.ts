import { format, isSameDay } from "date-fns";

import { ProgressWorkoutLogUI } from "@/lib/progress/type";

export function formatProgressPeriodSubtitle(
	weekOffset: number,
	weekStart: Date,
	weekEnd: Date,
): string {
	const tagline = "track your fitness journey";
	if (weekOffset === 0) {
		return `Last 7 days · ${tagline}`;
	}
	return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")} · ${tagline}`;
}

export function formatProgressPeriodAriaLabel(
	weekOffset: number,
	weekStart: Date,
	weekEnd: Date,
): string {
	if (weekOffset === 0) {
		return "the last 7 days";
	}
	return `${format(weekStart, "MMM d")} to ${format(weekEnd, "MMM d, yyyy")}`;
}

export function getLogsForDay(logs: ProgressWorkoutLogUI[], day: Date) {
	return logs.filter((log) => isSameDay(new Date(log.endDate), day));
}

export function hasWorkoutOnDay(logs: ProgressWorkoutLogUI[], day: Date) {
	return getLogsForDay(logs, day).length > 0;
}
