"use client";

import { format } from "date-fns";
import { Dumbbell, Loader2, Plus } from "lucide-react";

import { ProgressWorkoutLogCard } from "@/app/(dashboard)/progress/_components/progress-workout-log-card";
import {
	getLogsForDay,
	MOCK_PROGRESS_LOGS,
	MOCK_PROGRESS_PROGRAMS,
} from "@/app/(dashboard)/progress/_lib/mock-workout-logs";
import { Button } from "@/components/ui/button";

type ProgressDayLogsProps = {
	selectedDate: Date;
	onLogWorkout: () => void;
	isLoading?: boolean;
};

export function ProgressDayLogs({
	selectedDate,
	onLogWorkout,
	isLoading = false,
}: ProgressDayLogsProps) {
	const logsForDay = getLogsForDay(MOCK_PROGRESS_LOGS, selectedDate);

	return (
		<section aria-label="Workouts for selected day">
			<h3 className="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
				{format(selectedDate, "EEEE, MMMM d")}
			</h3>

			{isLoading ? (
				<div className="flex justify-center py-8">
					<Loader2 className="h-6 w-6 animate-spin text-orange-500" />
				</div>
			) : logsForDay.length === 0 ? (
				<ProgressDayLogsEmpty onLogWorkout={onLogWorkout} />
			) : (
				<ul className="space-y-3">
					{logsForDay.map((log) => {
						const program = MOCK_PROGRESS_PROGRAMS.find((p) => p.id === log.programId);
						return (
							<li key={log.id}>
								<ProgressWorkoutLogCard
									log={log}
									programName={program?.name ?? "General Workout"}
								/>
							</li>
						);
					})}
				</ul>
			)}
		</section>
	);
}

function ProgressDayLogsEmpty({ onLogWorkout }: { onLogWorkout: () => void }) {
	return (
		<div className="rounded-2xl bg-white py-8 text-center dark:bg-gray-800">
			<Dumbbell className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" aria-hidden />
			<p className="mb-4 text-gray-500 dark:text-gray-400">No workouts logged</p>
			<Button onClick={onLogWorkout} className="bg-orange-500 text-white hover:bg-orange-600">
				<Plus className="mr-2 h-4 w-4" />
				Log Workout
			</Button>
		</div>
	);
}
