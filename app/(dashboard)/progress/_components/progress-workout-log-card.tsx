"use client";

import { motion } from "framer-motion";
import { Clock, Weight } from "lucide-react";

import { ProgressWorkoutLogUI } from "@/lib/progress/type";

type ProgressWorkoutLogCardProps = {
	log: ProgressWorkoutLogUI;
};

export function ProgressWorkoutLogCard({ log }: ProgressWorkoutLogCardProps) {
	return (
		<motion.article
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className="rounded-2xl bg-white p-4 dark:bg-gray-800"
		>
			<div className="mb-3">
				<h4 className="font-semibold text-gray-900 dark:text-white">{log.programName}</h4>
				<p className="text-sm text-gray-500 dark:text-gray-400">
					{log.exerciseCount} {log.exerciseCount === 1 ? "exercise" : "exercises"}
				</p>
			</div>
			<div className="flex gap-4">
				<div className="flex items-center gap-1.5">
					<Clock className="h-4 w-4 text-blue-500" aria-hidden />
					<span className="text-sm text-gray-600 dark:text-gray-300">
						{log.durationMinutes} min
					</span>
				</div>
				<div className="flex items-center gap-1.5">
					<Weight className="h-4 w-4 text-red-500" aria-hidden />
					<span className="text-sm text-gray-600 dark:text-gray-300">
						{log.volume.toLocaleString()} vol
					</span>
				</div>
			</div>
		</motion.article>
	);
}
