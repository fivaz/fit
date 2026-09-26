"use client";

import { Clock, Dumbbell, Timer, Weight } from "lucide-react";

import { ProgressStatCard } from "@/app/(dashboard)/progress/_components/progress-stat-card";
import { useProgressStats } from "@/app/(dashboard)/progress/_hooks/use-progress-stats";
import { formatRestDuration } from "@/lib/progress/calculate-stats";
import { getTrend } from "@/lib/progress/trend";

type ProgressStatsGridProps = {
	weekStart: Date;
	weekEnd: Date;
	periodAriaLabel: string;
};

export function ProgressStatsGrid({ weekStart, weekEnd, periodAriaLabel }: ProgressStatsGridProps) {
	const { stats, previousStats, isLoading } = useProgressStats(weekStart, weekEnd);

	// Averages over zero workouts are just 0, so comparing them would show a misleading arrow.
	const canCompareAverages =
		previousStats !== null && previousStats.workoutCount > 0 && stats.workoutCount > 0;

	return (
		<div className="mb-6 grid grid-cols-2 gap-3">
			<ProgressStatCard
				regionLabel={`Workouts in ${periodAriaLabel}`}
				valueLabel="Workout count value"
				value={stats.workoutCount}
				caption="Workouts"
				icon={Dumbbell}
				variant="primary"
				isLoading={isLoading}
				trend={previousStats ? getTrend(stats.workoutCount, previousStats.workoutCount) : undefined}
			/>
			<ProgressStatCard
				regionLabel={`Average workout duration in ${periodAriaLabel}`}
				valueLabel="Average workout minutes value"
				value={stats.avgWorkoutMinutes}
				caption="Avg min"
				icon={Clock}
				iconClassName="text-blue-500"
				animationDelay={0.05}
				isLoading={isLoading}
				trend={
					canCompareAverages
						? getTrend(stats.avgWorkoutMinutes, previousStats.avgWorkoutMinutes)
						: undefined
				}
			/>
			<ProgressStatCard
				regionLabel={`Average workout volume in ${periodAriaLabel}`}
				valueLabel="Average workout volume value"
				value={stats.avgWorkoutVolume.toLocaleString()}
				caption="Avg volume"
				icon={Weight}
				iconClassName="text-red-500"
				animationDelay={0.1}
				isLoading={isLoading}
				trend={
					canCompareAverages
						? getTrend(stats.avgWorkoutVolume, previousStats.avgWorkoutVolume)
						: undefined
				}
			/>
			<ProgressStatCard
				regionLabel={`Average rest between sets in ${periodAriaLabel}`}
				valueLabel="Average rest between sets value"
				value={formatRestDuration(stats.avgRestSeconds)}
				caption="Avg rest"
				icon={Timer}
				iconClassName="text-green-500"
				animationDelay={0.15}
				isLoading={isLoading}
				trend={
					canCompareAverages
						? getTrend(stats.avgRestSeconds, previousStats.avgRestSeconds)
						: undefined
				}
			/>
		</div>
	);
}
