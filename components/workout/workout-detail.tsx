"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { format } from "date-fns";
import { CheckCircle, CloudCheck, CloudUpload, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { WorkoutTimer } from "@/components/timer";
import { Button } from "@/components/ui/button";
import { ExerciseCard } from "@/components/workout/workout-exercise-row";
import { WorkoutProgressFlash } from "@/components/workout/workout-progress-flash";
import { useConfirm } from "@/hooks/confirm/use-confirm";
import { useActiveWorkoutHome } from "@/hooks/workout/active-workout-home";
import { useWorkoutSetCompletionFlash } from "@/hooks/workout/use-workout-set-completion-flash";
import { useWorkoutSetsSync } from "@/hooks/workout/use-workout-sets-sync";
import { ROUTES } from "@/lib/consts";
import { logError } from "@/lib/logger";
import {
	buildWorkoutLiveActivityPayload,
	dismissWorkoutLiveActivity,
} from "@/lib/mobile/workout-live-activity";
import { finishWorkout, syncWorkoutSets } from "@/lib/workout/api";
import { getLatestSetTimeFromWorkoutSets } from "@/lib/workout/set-time";
import { WorkoutSetMap, WorkoutWithMappedSets } from "@/lib/workout/type";

type WorkoutDetailProps = {
	initialWorkout: WorkoutWithMappedSets;
};

export function WorkoutDetail({ initialWorkout }: WorkoutDetailProps) {
	const [exerciseSets, setExerciseSets] = useState<WorkoutSetMap>(initialWorkout.exerciseSets);
	const { isSyncing } = useWorkoutSetsSync(initialWorkout.id, exerciseSets);
	const [isFinishing, setIsFinishing] = useState(false);
	const confirm = useConfirm();
	const router = useRouter();
	const { refreshActiveWorkout, setLiveActivityExerciseSets } = useActiveWorkoutHome();
	const { flash } = useWorkoutSetCompletionFlash(initialWorkout, exerciseSets);

	useEffect(() => {
		setLiveActivityExerciseSets(exerciseSets);
		return () => setLiveActivityExerciseSets(null);
	}, [exerciseSets, setLiveActivityExerciseSets]);

	async function handleFinish() {
		const confirmed = await confirm({
			title: "Finish Workout",
			message: "Are you sure you want to finish this workout?",
			confirmLabel: "Yes, finish",
		});

		if (!confirmed) return;

		setIsFinishing(true);

		try {
			await syncWorkoutSets(initialWorkout.id, exerciseSets);
			await finishWorkout(initialWorkout.id);
			await dismissWorkoutLiveActivity(
				buildWorkoutLiveActivityPayload(initialWorkout, exerciseSets),
			);
			refreshActiveWorkout();
			const endDate = getLatestSetTimeFromWorkoutSets(exerciseSets) ?? new Date();
			toast.success(`Workout finished on ${format(endDate, "PPpp")}`);
			router.push(ROUTES.PROGRESS);
		} catch (error) {
			logError(error, "WorkoutDetail#handleFinish");
			toast.error("Failed to finish workout");
		} finally {
			setIsFinishing(false);
		}
	}

	return (
		<>
			<WorkoutProgressFlash flash={flash} />
			<header className="sticky top-0 isolate z-20 border-b border-gray-200 bg-white pt-[max(3rem,env(safe-area-inset-top))] shadow-sm dark:border-gray-700 dark:bg-gray-900">
				<div className="px-5 pb-4">
					<div className="flex items-start justify-between">
						<div>
							<div className="flex items-center gap-2">
								<h1 className="text-lg font-bold">{initialWorkout.program?.name}</h1>
								{isSyncing ? (
									<CloudUpload
										aria-label="syncing-icon"
										className="h-4 w-4 animate-pulse text-orange-500"
									/>
								) : (
									<CloudCheck aria-label="synced-icon" className="h-4 w-4 text-green-500" />
								)}
							</div>
							<div className="flex items-center gap-2 text-sm">
								<span className="text-gray-500">{initialWorkout.exercises.length} exercises</span>
								<span>•</span>
								<WorkoutTimer startDate={initialWorkout.startDate} />
							</div>
						</div>
						<Button variant="outline" disabled={isFinishing} onClick={handleFinish}>
							{isFinishing ? <Loader2Icon className="animate-spin" /> : <CheckCircle />}
							Finish
						</Button>
					</div>
				</div>
			</header>

			<div className="space-y-6 px-5 py-6">
				{initialWorkout.exercises.map((exercise, index) => (
					<ExerciseCard
						key={exercise.id}
						exercise={exercise}
						index={index}
						sets={exerciseSets[exercise.id] || []}
						setExerciseSets={setExerciseSets}
						isPending={isFinishing}
					/>
				))}
			</div>
		</>
	);
}
