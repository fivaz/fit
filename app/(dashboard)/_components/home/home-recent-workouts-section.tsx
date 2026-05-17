"use client";

import Link from "next/link";

import { motion } from "framer-motion";
import { ChevronRight, Dumbbell, Loader2 } from "lucide-react";

import { useHomeRecentWorkouts } from "@/app/(dashboard)/_components/home/use-home-recent-workouts";
import { ROUTES } from "@/lib/consts";
import { formatWorkoutEndedCaption } from "@/lib/progress/utils";
import { cn } from "@/lib/utils";

function formatMuscleLine(muscles: string[]): string {
	return muscles.map((m) => m.replace(/_/g, " ")).join(", ");
}

export function HomeRecentWorkoutsSection() {
	const { workouts, isLoading } = useHomeRecentWorkouts();

	return (
		<div className="pb-8">
			<div className="mb-3 flex items-center justify-between">
				<h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
					Recent workouts
				</h3>
				<Link
					href={ROUTES.PROGRESS}
					className="flex items-center text-sm font-medium text-orange-500"
				>
					See all <ChevronRight className="h-4 w-4" aria-hidden />
				</Link>
			</div>

			{isLoading ? (
				<div className="flex justify-center py-8">
					<Loader2 className="h-6 w-6 animate-spin text-orange-500" aria-label="Loading workouts" />
				</div>
			) : workouts.length === 0 ? (
				<div className="rounded-2xl bg-white py-8 text-center shadow-sm dark:bg-gray-800">
					<Dumbbell
						className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600"
						aria-hidden
					/>
					<p className="text-gray-500 dark:text-gray-400">No workouts yet</p>
				</div>
			) : (
				<ul className="space-y-3">
					{workouts.map((workout, index) => {
						const endedAt = new Date(workout.endDate);
						const subtitle =
							workout.programMuscles.length > 0
								? formatMuscleLine(workout.programMuscles)
								: `${workout.exerciseCount} ${workout.exerciseCount === 1 ? "exercise" : "exercises"}`;

						return (
							<li key={workout.id}>
								<motion.article
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.05 + index * 0.05 }}
									className="relative flex items-center gap-4 rounded-2xl bg-white p-4 pr-12 shadow-sm dark:bg-gray-800"
								>
									<time
										dateTime={workout.endDate}
										className="absolute top-3 right-11 max-w-[calc(100%-8rem)] truncate text-right text-xs font-medium text-gray-500 dark:text-gray-400"
									>
										{formatWorkoutEndedCaption(endedAt)}
									</time>
									<div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl">
										<img
											src={workout.programImageUrl || "/exercise.jpg"}
											alt=""
											className="h-full w-full object-cover"
										/>
									</div>
									<div className="min-w-0 flex-1 pt-1">
										<h4 className="truncate pr-2 font-semibold text-gray-900 dark:text-white">
											{workout.programName}
										</h4>
										<p
											className={cn(
												"text-sm text-gray-500 dark:text-gray-400",
												workout.programMuscles.length > 0 && "capitalize",
											)}
										>
											{subtitle}
										</p>
									</div>
									<ChevronRight
										className="absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-gray-400"
										aria-hidden
									/>
								</motion.article>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
