"use client";

import { useCallback, useMemo, useState } from "react";

import { isSameDay } from "date-fns";

import { ProgressDayLogs } from "@/app/(dashboard)/progress/_components/progress-day-logs";
import { ProgressHeader } from "@/app/(dashboard)/progress/_components/progress-header";
import { ProgressStatsGrid } from "@/app/(dashboard)/progress/_components/progress-stats-grid";
import { ProgressWeekCalendar } from "@/app/(dashboard)/progress/_components/progress-week-calendar";
import { useProgressLogs } from "@/app/(dashboard)/progress/_hooks/use-progress-logs";
import {
	getProgressWeekRange,
	useProgressWeekRange,
} from "@/app/(dashboard)/progress/_hooks/use-progress-week-range";
import {
	formatProgressPeriodAriaLabel,
	formatProgressPeriodSubtitle,
	getLogsForDay,
	hasWorkoutOnDay,
} from "@/lib/progress/utils";

export default function ProgressPage() {
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [weekOffset, setWeekOffset] = useState(0);

	const { weekStart, weekEnd } = useProgressWeekRange(weekOffset);
	const { logs, isLoading } = useProgressLogs(weekStart, weekEnd);

	const periodSubtitle = useMemo(
		() => formatProgressPeriodSubtitle(weekOffset, weekStart, weekEnd),
		[weekOffset, weekStart, weekEnd],
	);
	const periodAriaLabel = useMemo(
		() => formatProgressPeriodAriaLabel(weekOffset, weekStart, weekEnd),
		[weekOffset, weekStart, weekEnd],
	);

	const logsForSelectedDay = useMemo(() => getLogsForDay(logs, selectedDate), [logs, selectedDate]);

	const checkWorkoutOnDay = useCallback((day: Date) => hasWorkoutOnDay(logs, day), [logs]);

	const handleWeekOffsetChange = useCallback((updater: (prev: number) => number) => {
		setWeekOffset((prev) => {
			const next = updater(prev);
			if (next === prev) return prev;

			const { weekDays } = getProgressWeekRange(next);
			setSelectedDate((current) => {
				const isInWeek = weekDays.some((day) => isSameDay(day, current));
				return isInWeek ? current : weekDays[0];
			});
			return next;
		});
	}, []);

	return (
		<>
			<div className="pb-6">
				<ProgressHeader subtitle={periodSubtitle} />
				<ProgressStatsGrid
					weekStart={weekStart}
					weekEnd={weekEnd}
					periodAriaLabel={periodAriaLabel}
				/>
				<ProgressWeekCalendar
					weekOffset={weekOffset}
					onWeekOffsetChange={handleWeekOffsetChange}
					selectedDate={selectedDate}
					onSelectedDateChange={setSelectedDate}
					hasWorkoutOnDay={checkWorkoutOnDay}
				/>
			</div>

			<ProgressDayLogs
				selectedDate={selectedDate}
				logs={logsForSelectedDay}
				isLoading={isLoading}
			/>
		</>
	);
}
