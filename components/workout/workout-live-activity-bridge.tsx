"use client";

import { useEffect, useRef } from "react";

import {
	buildWorkoutLiveActivityPayload,
	startWorkoutLiveActivity,
	updateWorkoutLiveActivity,
	WorkoutLiveActivityPayload,
} from "@/lib/mobile/workout-live-activity";
import { WorkoutSetMap, WorkoutWithMappedSets } from "@/lib/workout/type";

const ELAPSED_UPDATE_MS = 60_000;

type WorkoutLiveActivityBridgeProps = {
	workout: WorkoutWithMappedSets;
	exerciseSetsOverride: WorkoutSetMap | null;
	onPayloadChange?: (payload: WorkoutLiveActivityPayload) => void;
};

export function WorkoutLiveActivityBridge({
	workout,
	exerciseSetsOverride,
	onPayloadChange,
}: WorkoutLiveActivityBridgeProps) {
	const startedRef = useRef(false);
	const lastWorkoutIdRef = useRef<string | null>(null);

	useEffect(() => {
		if (lastWorkoutIdRef.current !== workout.id) {
			startedRef.current = false;
			lastWorkoutIdRef.current = workout.id;
		}

		const exerciseSets = exerciseSetsOverride ?? workout.exerciseSets;
		const payload = buildWorkoutLiveActivityPayload(workout, exerciseSets);
		onPayloadChange?.(payload);

		if (!startedRef.current) {
			startedRef.current = true;
			void startWorkoutLiveActivity(payload);
			return;
		}

		void updateWorkoutLiveActivity(payload);
	}, [workout, exerciseSetsOverride, onPayloadChange]);

	useEffect(() => {
		const tick = () => {
			const exerciseSets = exerciseSetsOverride ?? workout.exerciseSets;
			const payload = buildWorkoutLiveActivityPayload(workout, exerciseSets);
			onPayloadChange?.(payload);
			void updateWorkoutLiveActivity(payload);
		};

		const intervalId = window.setInterval(tick, ELAPSED_UPDATE_MS);
		return () => window.clearInterval(intervalId);
	}, [workout, exerciseSetsOverride, onPayloadChange]);

	return null;
}
