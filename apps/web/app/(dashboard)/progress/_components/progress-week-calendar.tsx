"use client";

import { useMemo } from "react";

import { eachDayOfInterval, endOfWeek, format, isSameDay, startOfWeek, subDays } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProgressWeekCalendarProps = {
	weekOffset: number;
	onWeekOffsetChange: (updater: (prev: number) => number) => void;
	selectedDate: Date;
	onSelectedDateChange: (date: Date) => void;
	hasWorkoutOnDay: (day: Date) => boolean;
};

export function ProgressWeekCalendar({
	weekOffset,
	onWeekOffsetChange,
	selectedDate,
	onSelectedDateChange,
	hasWorkoutOnDay,
}: ProgressWeekCalendarProps) {
	const currentWeekStart = useMemo(() => {
		const today = new Date();
		const start = startOfWeek(today, { weekStartsOn: 1 });
		return subDays(start, weekOffset * 7);
	}, [weekOffset]);

	const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
	const weekDays = eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd });

	return (
		<>
			<div className="mb-4 flex items-center justify-between">
				<Button
					variant="ghost"
					size="icon"
					aria-label="Previous week"
					onClick={() => onWeekOffsetChange((prev) => prev + 1)}
					className="rounded-xl"
				>
					<ChevronLeft className="h-5 w-5" />
				</Button>
				<p className="text-sm font-medium text-gray-700 dark:text-gray-300">
					{format(currentWeekStart, "MMM d")} - {format(currentWeekEnd, "MMM d, yyyy")}
				</p>
				<Button
					variant="ghost"
					size="icon"
					aria-label="Next week"
					onClick={() => onWeekOffsetChange((prev) => Math.max(0, prev - 1))}
					disabled={weekOffset === 0}
					className="rounded-xl"
				>
					<ChevronRight className="h-5 w-5" />
				</Button>
			</div>

			<div className="flex gap-2">
				{weekDays.map((day) => {
					const isSelected = isSameDay(day, selectedDate);
					const isToday = isSameDay(day, new Date());
					const hasLog = hasWorkoutOnDay(day);

					return (
						<button
							key={day.toISOString()}
							type="button"
							aria-label={format(day, "EEEE, MMMM d")}
							aria-pressed={isSelected}
							onClick={() => onSelectedDateChange(day)}
							className={cn(
								"flex flex-1 flex-col items-center rounded-xl py-3 transition-all",
								isSelected
									? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
									: "bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300",
							)}
						>
							<span className="text-xs opacity-70">{format(day, "EEE")}</span>
							<span className="mt-0.5 text-lg font-semibold">{format(day, "d")}</span>
							{hasLog && !isSelected && (
								<div className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500" aria-hidden />
							)}
							{isToday && !isSelected && (
								<div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" aria-hidden />
							)}
						</button>
					);
				})}
			</div>
		</>
	);
}
