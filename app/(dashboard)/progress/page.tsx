"use client";

import { useCallback, useState } from "react";

import { ProgressDayLogs } from "@/app/(dashboard)/progress/_components/progress-day-logs";
import { ProgressHeader } from "@/app/(dashboard)/progress/_components/progress-header";
import { ProgressStatsGrid } from "@/app/(dashboard)/progress/_components/progress-stats-grid";
import { ProgressWeekCalendar } from "@/app/(dashboard)/progress/_components/progress-week-calendar";
import {
	hasWorkoutOnDay,
	MOCK_PROGRESS_LOGS,
} from "@/app/(dashboard)/progress/_lib/mock-workout-logs";

export default function ProgressPage() {
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [weekOffset, setWeekOffset] = useState(0);

	const handleLogWorkout = useCallback(() => {
		// Log workout modal — not implemented yet
	}, []);

	const checkWorkoutOnDay = useCallback(
		(day: Date) => hasWorkoutOnDay(MOCK_PROGRESS_LOGS, day),
		[],
	);

	return (
		<>
			<div className="pb-6">
				<ProgressHeader onLogWorkout={handleLogWorkout} />
				<ProgressStatsGrid />
				<ProgressWeekCalendar
					weekOffset={weekOffset}
					onWeekOffsetChange={setWeekOffset}
					selectedDate={selectedDate}
					onSelectedDateChange={setSelectedDate}
					hasWorkoutOnDay={checkWorkoutOnDay}
				/>
			</div>

			<ProgressDayLogs selectedDate={selectedDate} onLogWorkout={handleLogWorkout} />
		</>
	);
}
