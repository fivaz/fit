"use client";

import { useCallback, useMemo, useState } from "react";

import { ProgressDayLogs } from "@/app/(dashboard)/progress/_components/progress-day-logs";
import { ProgressHeader } from "@/app/(dashboard)/progress/_components/progress-header";
import { ProgressStatsGrid } from "@/app/(dashboard)/progress/_components/progress-stats-grid";
import { ProgressWeekCalendar } from "@/app/(dashboard)/progress/_components/progress-week-calendar";
import { useProgressLogs } from "@/app/(dashboard)/progress/_hooks/use-progress-logs";
import { useProgressWeekRange } from "@/app/(dashboard)/progress/_hooks/use-progress-week-range";
import { getLogsForDay, hasWorkoutOnDay } from "@/lib/progress/utils";

export default function ProgressPage() {
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [weekOffset, setWeekOffset] = useState(0);

	const { weekStart, weekEnd } = useProgressWeekRange(weekOffset);
	const { logs, isLoading } = useProgressLogs(weekStart, weekEnd);

	const logsForSelectedDay = useMemo(() => getLogsForDay(logs, selectedDate), [logs, selectedDate]);

	const checkWorkoutOnDay = useCallback((day: Date) => hasWorkoutOnDay(logs, day), [logs]);

	return (
		<>
			<div className="pb-6">
				<ProgressHeader />
				<ProgressStatsGrid />
				<ProgressWeekCalendar
					weekOffset={weekOffset}
					onWeekOffsetChange={setWeekOffset}
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
