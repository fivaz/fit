"use client";

import { Clock, Dumbbell, Loader2, Timer, Weight } from "lucide-react";

import { ProgressStatCard } from "@/app/(dashboard)/progress/_components/progress-stat-card";
import { useProgressStats } from "@/app/(dashboard)/progress/_hooks/use-progress-stats";
import { formatRestDuration } from "@/lib/progress/calculate-stats";

export function ProgressStatsGrid() {
	const { stats, isLoading } = useProgressStats();

	if (isLoading) {
		return (
			<div className="mb-6 grid grid-cols-2 gap-3">
				<div className="col-span-2 flex justify-center py-8">
					<Loader2 className="h-6 w-6 animate-spin text-orange-500" />
				</div>
			</div>
		);
	}

	return (
		<div className="mb-6 grid grid-cols-2 gap-3">
			<ProgressStatCard
				regionLabel="Workouts in the last 7 days"
				valueLabel="Workout count value"
				value={stats.workoutCount}
				caption="Workouts"
				icon={Dumbbell}
				variant="primary"
			/>
			<ProgressStatCard
				regionLabel="Average workout duration in the last 7 days"
				valueLabel="Average workout minutes value"
				value={stats.avgWorkoutMinutes}
				caption="Avg min"
				icon={Clock}
				iconClassName="text-blue-500"
				animationDelay={0.05}
			/>
			<ProgressStatCard
				regionLabel="Average workout volume in the last 7 days"
				valueLabel="Average workout volume value"
				value={stats.avgWorkoutVolume.toLocaleString()}
				caption="Avg volume"
				icon={Weight}
				iconClassName="text-red-500"
				animationDelay={0.1}
			/>
			<ProgressStatCard
				regionLabel="Average rest between sets in the last 7 days"
				valueLabel="Average rest between sets value"
				value={formatRestDuration(stats.avgRestSeconds)}
				caption="Avg rest"
				icon={Timer}
				iconClassName="text-green-500"
				animationDelay={0.15}
			/>
		</div>
	);
}
