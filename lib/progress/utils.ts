import { isSameDay } from "date-fns";

import { ProgressWorkoutLogUI } from "@/lib/progress/type";

export function getLogsForDay(logs: ProgressWorkoutLogUI[], day: Date) {
	return logs.filter((log) => isSameDay(new Date(log.endDate), day));
}

export function hasWorkoutOnDay(logs: ProgressWorkoutLogUI[], day: Date) {
	return getLogsForDay(logs, day).length > 0;
}
