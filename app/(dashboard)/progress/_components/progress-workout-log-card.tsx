"use client";

import { motion } from "framer-motion";
import { Clock, Flame } from "lucide-react";

import type { ProgressWorkoutLog } from "@/app/(dashboard)/progress/_lib/mock-workout-logs";

type ProgressWorkoutLogCardProps = {
	log: ProgressWorkoutLog;
	programName: string;
};

export function ProgressWorkoutLogCard({ log, programName }: ProgressWorkoutLogCardProps) {
	return (
		<motion.article
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className="rounded-2xl bg-white p-4 dark:bg-gray-800"
		>
			<div className="mb-3 flex items-start justify-between">
				<div>
					<h4 className="font-semibold text-gray-900 dark:text-white">{programName}</h4>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						{log.exercisesCompleted} exercises
					</p>
				</div>
			</div>
			<div className="flex gap-4">
				<div className="flex items-center gap-1.5">
					<Clock className="h-4 w-4 text-blue-500" aria-hidden />
					<span className="text-sm text-gray-600 dark:text-gray-300">
						{log.durationMinutes} min
					</span>
				</div>
				<div className="flex items-center gap-1.5">
					<Flame className="h-4 w-4 text-red-500" aria-hidden />
					<span className="text-sm text-gray-600 dark:text-gray-300">{log.caloriesBurned} cal</span>
				</div>
			</div>
			{log.notes ? (
				<p className="mt-3 border-t border-gray-100 pt-3 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
					{log.notes}
				</p>
			) : null}
		</motion.article>
	);
}
