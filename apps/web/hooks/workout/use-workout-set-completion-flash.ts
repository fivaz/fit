"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { isCompletedSet } from "@/lib/workout/exercise-progress";
import { WorkoutSetMap, WorkoutWithMappedSets } from "@/lib/workout/type";
import {
	buildWorkoutProgressDisplay,
	type WorkoutProgressDisplay,
} from "@/lib/workout/workout-progress-display";

export const WORKOUT_PROGRESS_FLASH_MS = 1000;

export type WorkoutProgressFlashSnapshot = WorkoutProgressDisplay & {
	progressFrom: number;
	flashKey: number;
};

function didAnySetBecomeComplete(
	exerciseIds: string[],
	prev: WorkoutSetMap,
	next: WorkoutSetMap,
): boolean {
	for (const exerciseId of exerciseIds) {
		const prevSets = prev[exerciseId] ?? [];
		const nextSets = next[exerciseId] ?? [];

		for (const nextSet of nextSets) {
			const prevSet = prevSets.find((set) => set.id === nextSet.id);
			if (prevSet && !isCompletedSet(prevSet) && isCompletedSet(nextSet)) {
				return true;
			}
		}
	}
	return false;
}

export function useWorkoutSetCompletionFlash(
	workout: WorkoutWithMappedSets,
	exerciseSets: WorkoutSetMap,
) {
	const [flash, setFlash] = useState<WorkoutProgressFlashSnapshot | null>(null);
	const prevSetsRef = useRef<WorkoutSetMap | null>(null);
	const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const flashKeyRef = useRef(0);

	const showFlash = useCallback(
		(prev: WorkoutSetMap, next: WorkoutSetMap) => {
			const fromDisplay = buildWorkoutProgressDisplay(workout, prev);
			const toDisplay = buildWorkoutProgressDisplay(workout, next);

			if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

			flashKeyRef.current += 1;
			setFlash({
				...toDisplay,
				progressFrom: fromDisplay.progress,
				flashKey: flashKeyRef.current,
			});

			hideTimerRef.current = setTimeout(() => {
				hideTimerRef.current = null;
				setFlash(null);
			}, WORKOUT_PROGRESS_FLASH_MS);
		},
		[workout],
	);

	useEffect(() => {
		const prev = prevSetsRef.current;
		prevSetsRef.current = exerciseSets;

		if (!prev) return;

		const exerciseIds = workout.exercises.map((exercise) => exercise.id);
		if (didAnySetBecomeComplete(exerciseIds, prev, exerciseSets)) {
			showFlash(prev, exerciseSets);
		}
	}, [exerciseSets, workout, showFlash]);

	useEffect(() => {
		return () => {
			if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
		};
	}, []);

	return { flash };
}
