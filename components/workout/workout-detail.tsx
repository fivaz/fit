"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { format } from "date-fns";
import { CheckCircle, CloudCheck, CloudUpload, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { useDebounceValue } from "usehooks-ts";

import { WorkoutTimer } from "@/components/timer";
import { Button } from "@/components/ui/button";
import { ExerciseCard } from "@/components/workout/workout-exercise-row";
import { useConfirm } from "@/hooks/confirm/use-confirm";
import { ROUTES } from "@/lib/consts";
import { logError } from "@/lib/logger";
import {
	finishWorkoutAction,
	syncWorkoutSetsAction,
	WorkoutWithMappedSets,
} from "@/lib/workout/actions";
import { WorkoutSetMap } from "@/lib/workout/type";

type WorkoutDetailProps = {
	initialWorkout: WorkoutWithMappedSets;
};

export function WorkoutDetail({ initialWorkout }: WorkoutDetailProps) {
	const [exerciseSets, setExerciseSets] = useState<WorkoutSetMap>(initialWorkout.exerciseSets);
	const [debouncedSets] = useDebounceValue(exerciseSets, 1800);
	const [isSyncing, setIsSyncing] = useState(false);
	const [isFinishing, setIsFinishing] = useState(false);
	const isFirstRender = useRef(true);
	const confirm = useConfirm();
	const router = useRouter();

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}

		const syncData = async () => {
			setIsSyncing(true);
			try {
				await syncWorkoutSetsAction(initialWorkout.id, debouncedSets);
			} catch (error) {
				logError(error, "WorkoutDetail#syncData", {
					extra: {
						initialWorkoutId: initialWorkout.id,
						debouncedSets,
					},
				});
				toast.error("Sync failed, trying again...");
			} finally {
				setIsSyncing(false);
			}
		};

		void syncData();
	}, [debouncedSets, initialWorkout.id]);

	async function handleFinish() {
		const confirmed = await confirm({
			title: "Finish Workout",
			message: "Are you sure you want to finish this workout?",
			confirmLabel: "Yes, finish",
		});

		if (!confirmed) return;

		setIsFinishing(true);

		try {
			await finishWorkoutAction(initialWorkout.id);
			toast.success(`Workout finished on ${format(new Date(), "PPpp")}`);
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
			<header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 px-5 py-4 backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/80">
				<div className="flex items-center justify-between">
					<div>
						<div className="flex items-center gap-2">
							<h1 className="text-lg font-bold">{initialWorkout.program?.name}</h1>
							{isSyncing ? (
								<CloudUpload className="h-4 w-4 animate-pulse text-orange-500" />
							) : (
								<CloudCheck className="h-4 w-4 text-green-500" />
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
