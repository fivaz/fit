"use client";

import { useMemo } from "react";

import { eachDayOfInterval, endOfDay, endOfWeek, startOfDay, startOfWeek, subDays } from "date-fns";

export function getProgressWeekRange(weekOffset: number) {
	const today = new Date();
	const weekStart = startOfWeek(today, { weekStartsOn: 1 });
	const currentWeekStart = subDays(weekStart, weekOffset * 7);
	const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

	return {
		weekStart: startOfDay(currentWeekStart),
		weekEnd: endOfDay(currentWeekEnd),
		weekDays: eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd }),
	};
}

export function useProgressWeekRange(weekOffset: number) {
	return useMemo(() => getProgressWeekRange(weekOffset), [weekOffset]);
}
