"use client";

import { Dumbbell } from "lucide-react";

import { WorkoutDumbbellProgressBar } from "@/components/workout/workout-dumbbell-progress-bar";
import type { WorkoutProgressDisplay } from "@/lib/workout/workout-progress-display";

type WorkoutProgressLiveCardProps = WorkoutProgressDisplay & {
	progressFrom?: number;
	progressAnimateMs?: number;
};

function StatPill({ label, value }: { label: string; value: number }) {
	return (
		<div className="min-w-0">
			<p className="text-[10px] text-gray-500 dark:text-gray-400">{label}</p>
			<p className="font-mono text-lg font-semibold tabular-nums">{value}</p>
		</div>
	);
}

export function WorkoutProgressLiveCard({
	programName,
	elapsed,
	exercisesDone,
	exercisesLeft,
	setsDone,
	setsTotal,
	progress,
	progressFrom,
	progressAnimateMs,
}: WorkoutProgressLiveCardProps) {
	return (
		<div
			className="rounded-2xl border border-gray-200/80 bg-white/95 p-4 shadow-lg backdrop-blur-md dark:border-gray-700/80 dark:bg-gray-900/95"
			role="status"
			aria-live="polite"
			aria-label={`Set logged. ${setsDone} of ${setsTotal} sets complete.`}
		>
			<div className="mb-3 flex items-center gap-2">
				<Dumbbell className="size-5 shrink-0 text-[#FF6100]" aria-hidden />
				<p className="min-w-0 flex-1 truncate text-base font-semibold">{programName}</p>
				<p className="shrink-0 font-mono text-lg font-semibold tabular-nums">{elapsed}</p>
			</div>

			<div className="mb-3">
				<div className="mb-2 flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
					<span>Sets</span>
					<span className="font-mono font-semibold tabular-nums">
						{setsDone}/{setsTotal}
					</span>
				</div>
				<WorkoutDumbbellProgressBar
					progress={progress}
					setsDone={setsDone}
					animateFrom={progressFrom}
					durationMs={progressAnimateMs}
				/>
			</div>

			<div className="flex gap-5">
				<StatPill label="Exercises done" value={exercisesDone} />
				<StatPill label="Exercises left" value={exercisesLeft} />
			</div>
		</div>
	);
}
