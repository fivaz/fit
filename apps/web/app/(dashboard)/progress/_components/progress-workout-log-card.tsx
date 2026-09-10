"use client";

import Link from "next/link";

import { motion } from "framer-motion";
import { ChevronRight, Clock, Weight } from "lucide-react";

import { ProgressWorkoutLogUI } from "@/lib/progress/type";
import { workoutDetailHref } from "@/lib/workout/navigation";

type ProgressWorkoutLogCardProps = {
	log: ProgressWorkoutLogUI;
};

export function ProgressWorkoutLogCard({ log }: ProgressWorkoutLogCardProps) {
	return (
		<Link
			href={workoutDetailHref(log.id)}
			className="block"
			aria-label={`View workout ${log.programName}`}
		>
			<motion.article
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				className="relative flex items-center gap-3 rounded-2xl bg-white p-4 pr-12 shadow-sm transition-shadow hover:shadow-md active:scale-[0.99] dark:bg-gray-800"
			>
				<div className="min-w-0 flex-1">
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
				</div>

				<ChevronRight
					className="absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-gray-400"
					aria-hidden
				/>
			</motion.article>
		</Link>
	);
}
