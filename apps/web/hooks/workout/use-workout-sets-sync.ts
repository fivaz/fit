"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { toast } from "sonner";

import { logError } from "@/lib/logger";
import { stageWorkoutSets, syncWorkoutSets } from "@/lib/workout/api";
import { WorkoutSetMap } from "@/lib/workout/type";

export const WORKOUT_SETS_SYNC_DEBOUNCE_MS = 1800;

function workoutSetMapsEqual(a: WorkoutSetMap, b: WorkoutSetMap): boolean {
	return JSON.stringify(a) === JSON.stringify(b);
}

type RunSyncOptions = {
	skipStateUpdate?: boolean;
};

export function useWorkoutSetsSync(workoutId: string, exerciseSets: WorkoutSetMap) {
	const [isSyncing, setIsSyncing] = useState(false);
	const exerciseSetsRef = useRef(exerciseSets);
	const lastSyncedSetsRef = useRef(exerciseSets);
	const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isFirstRenderRef = useRef(true);

	exerciseSetsRef.current = exerciseSets;

	const runSync = useCallback(
		async (sets: WorkoutSetMap, options?: RunSyncOptions) => {
			if (workoutSetMapsEqual(sets, lastSyncedSetsRef.current)) return;

			if (!options?.skipStateUpdate) setIsSyncing(true);
			try {
				stageWorkoutSets(workoutId, sets);
				await syncWorkoutSets(workoutId, sets);
				lastSyncedSetsRef.current = sets;
			} catch (error) {
				logError(error, "useWorkoutSetsSync#runSync", {
					extra: {
						workoutId,
						sets,
					},
				});
				if (!options?.skipStateUpdate) {
					toast.error("Sync failed, trying again...");
				}
			} finally {
				if (!options?.skipStateUpdate) setIsSyncing(false);
			}
		},
		[workoutId],
	);

	useEffect(() => {
		if (isFirstRenderRef.current) {
			isFirstRenderRef.current = false;
			return;
		}

		if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
		syncTimeoutRef.current = setTimeout(() => {
			syncTimeoutRef.current = null;
			void runSync(exerciseSets);
		}, WORKOUT_SETS_SYNC_DEBOUNCE_MS);

		return () => {
			if (syncTimeoutRef.current) {
				clearTimeout(syncTimeoutRef.current);
				syncTimeoutRef.current = null;
			}
		};
	}, [exerciseSets, runSync]);

	// Leaving the workout page cancels the debounce timer — flush any unsynced edits immediately.
	useEffect(() => {
		return () => {
			void runSync(exerciseSetsRef.current, { skipStateUpdate: true });
		};
	}, [runSync]);

	return { isSyncing };
}
