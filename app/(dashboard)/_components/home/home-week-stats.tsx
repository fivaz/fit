"use client";

import { Clock, Dumbbell, Timer, Weight } from "lucide-react";

import { ProgressStatCard } from "@/app/(dashboard)/progress/_components/progress-stat-card";
import { formatRestDuration } from "@/lib/progress/calculate-stats";

/** Template stats mirroring `ProgressStatsGrid` metrics until wired to real week range data. */
const MOCK_PERIOD_ARIA = "this week";
const MOCK_STATS = {
	workoutCount: 5,
	avgWorkoutMinutes: 42,
	avgWorkoutVolume: 12_580,
	avgRestSeconds: 95,
};

export function HomeWeekStats() {
	return (
		<div className="mb-8">
			<h3 className="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
				This Week
			</h3>
			<div className="grid grid-cols-2 gap-3">
				<ProgressStatCard
					regionLabel={`Workouts in ${MOCK_PERIOD_ARIA}`}
					valueLabel="Workout count value"
					value={MOCK_STATS.workoutCount}
					caption="Workouts"
					icon={Dumbbell}
					variant="primary"
				/>
				<ProgressStatCard
					regionLabel={`Average workout duration in ${MOCK_PERIOD_ARIA}`}
					valueLabel="Average workout minutes value"
					value={MOCK_STATS.avgWorkoutMinutes}
					caption="Avg min"
					icon={Clock}
					iconClassName="text-blue-500"
					animationDelay={0.05}
				/>
				<ProgressStatCard
					regionLabel={`Average workout volume in ${MOCK_PERIOD_ARIA}`}
					valueLabel="Average workout volume value"
					value={MOCK_STATS.avgWorkoutVolume.toLocaleString()}
					caption="Avg volume"
					icon={Weight}
					iconClassName="text-red-500"
					animationDelay={0.1}
				/>
				<ProgressStatCard
					regionLabel={`Average rest between sets in ${MOCK_PERIOD_ARIA}`}
					valueLabel="Average rest between sets value"
					value={formatRestDuration(MOCK_STATS.avgRestSeconds)}
					caption="Avg rest"
					icon={Timer}
					iconClassName="text-green-500"
					animationDelay={0.15}
				/>
			</div>
		</div>
	);
}
