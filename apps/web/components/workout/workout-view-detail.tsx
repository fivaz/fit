"use client";

import Link from "next/link";

import { format } from "date-fns";
import { ArrowLeft, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WorkoutViewSetList } from "@/components/workout/workout-view-set-list";
import { ROUTES } from "@/lib/consts";
import { formatWorkoutElapsed } from "@/lib/workout/elapsed";
import { WorkoutWithMappedSets } from "@/lib/workout/type";

type WorkoutViewDetailProps = {
	workout: WorkoutWithMappedSets;
};

export function WorkoutViewDetail({ workout }: WorkoutViewDetailProps) {
	const duration = workout.endDate
		? formatWorkoutElapsed(workout.startDate, workout.endDate)
		: null;

	return (
		<>
			<header className="sticky top-0 isolate z-20 border-b border-gray-200 bg-white pt-[max(3rem,env(safe-area-inset-top))] shadow-sm dark:border-gray-700 dark:bg-gray-900">
				<div className="px-5 pb-4">
					<div className="flex items-start gap-3">
						<Button variant="outline" size="icon" className="mt-0.5 shrink-0" asChild>
							<Link href={ROUTES.PROGRESS} aria-label="Back to progress">
								<ArrowLeft className="h-4 w-4" />
							</Link>
						</Button>
						<div className="min-w-0 flex-1">
							<h1 className="truncate text-lg font-bold">{workout.program?.name ?? "Workout"}</h1>
							<div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
								<span>
									{workout.exercises.length}{" "}
									{workout.exercises.length === 1 ? "exercise" : "exercises"}
								</span>
								{duration ? (
									<>
										<span aria-hidden>•</span>
										<div className="flex items-center gap-1.5 tabular-nums">
											<Clock className="h-3.5 w-3.5" aria-hidden />
											<span>{duration}</span>
										</div>
									</>
								) : null}
								{workout.endDate ? (
									<>
										<span aria-hidden>•</span>
										<time dateTime={new Date(workout.endDate).toISOString()}>
											{format(new Date(workout.endDate), "PPp")}
										</time>
									</>
								) : null}
							</div>
						</div>
					</div>
				</div>
			</header>

			<div className="px-5 py-6">
				<h2 className="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
					Completion order
				</h2>
				<WorkoutViewSetList workout={workout} />
			</div>
		</>
	);
}
