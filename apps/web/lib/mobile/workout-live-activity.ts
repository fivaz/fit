"use client";

import { LiveActivity } from "capacitor-live-activity";

import { logError } from "@/lib/logger";
import { isNativeMobileRuntime } from "@/lib/mobile/runtime";
import { WorkoutSetMap, WorkoutWithMappedSets } from "@/lib/workout/type";
import { buildWorkoutProgressDisplay } from "@/lib/workout/workout-progress-display";

export const WORKOUT_LIVE_ACTIVITY_ID = "active-workout";

export type WorkoutLiveActivityPayload = {
	workoutId: string;
	programName: string;
	startDate: Date | string;
	exerciseIds: string[];
	exerciseSets: WorkoutSetMap;
};

export function buildWorkoutLiveActivityPayload(
	workout: WorkoutWithMappedSets,
	exerciseSets: WorkoutSetMap,
): WorkoutLiveActivityPayload {
	return {
		workoutId: workout.id,
		programName: workout.program?.name ?? "Workout",
		startDate: workout.startDate,
		exerciseIds: workout.exercises.map((exercise) => exercise.id),
		exerciseSets,
	};
}

function buildContentState(payload: WorkoutLiveActivityPayload): Record<string, string> {
	const display = buildWorkoutProgressDisplay(
		{
			program: { name: payload.programName },
			startDate: payload.startDate,
			exercises: payload.exerciseIds.map((id) => ({ id })),
		},
		payload.exerciseSets,
	);

	return {
		programName: display.programName,
		elapsed: display.elapsed,
		exercisesDone: String(display.exercisesDone),
		exercisesLeft: String(display.exercisesLeft),
		setsDone: String(display.setsDone),
		setsTotal: String(display.setsTotal),
		setsProgress: String(display.progress),
	};
}

export async function isWorkoutLiveActivitySupported(): Promise<boolean> {
	if (!isNativeMobileRuntime()) return false;

	try {
		const { value } = await LiveActivity.isAvailable();
		return value;
	} catch {
		return false;
	}
}

export async function startWorkoutLiveActivity(payload: WorkoutLiveActivityPayload): Promise<void> {
	if (!(await isWorkoutLiveActivitySupported())) return;

	try {
		const contentState = buildContentState(payload);
		await LiveActivity.startActivity({
			id: WORKOUT_LIVE_ACTIVITY_ID,
			attributes: {
				workoutId: payload.workoutId,
				programName: payload.programName,
			},
			contentState,
			timestamp: Math.floor(new Date(payload.startDate).getTime() / 1000),
		});
	} catch (error) {
		logError(error, "startWorkoutLiveActivity", {
			extra: { workoutId: payload.workoutId },
		});
	}
}

export async function updateWorkoutLiveActivity(
	payload: WorkoutLiveActivityPayload,
): Promise<void> {
	if (!(await isWorkoutLiveActivitySupported())) return;

	try {
		const { value: isRunning } = await LiveActivity.isRunning({ id: WORKOUT_LIVE_ACTIVITY_ID });
		if (!isRunning) return;

		await LiveActivity.updateActivity({
			id: WORKOUT_LIVE_ACTIVITY_ID,
			contentState: buildContentState(payload),
		});
	} catch (error) {
		logError(error, "updateWorkoutLiveActivity", {
			extra: { workoutId: payload.workoutId },
		});
	}
}

/** Ends the workout Live Activity and removes it from the Lock Screen / Dynamic Island. */
export async function dismissWorkoutLiveActivity(
	payload?: WorkoutLiveActivityPayload,
): Promise<void> {
	if (!(await isWorkoutLiveActivitySupported())) return;

	const contentState = payload
		? buildContentState(payload)
		: {
				programName: "Workout",
				elapsed: "00:00",
				exercisesDone: "0",
				exercisesLeft: "0",
				setsDone: "0",
				setsTotal: "0",
				setsProgress: "1",
			};

	try {
		// dismissalDate = now tells ActivityKit to remove the UI promptly (not linger on .default).
		await LiveActivity.endActivity({
			id: WORKOUT_LIVE_ACTIVITY_ID,
			contentState,
			dismissalDate: Math.floor(Date.now() / 1000),
		});
	} catch (error) {
		logError(error, "dismissWorkoutLiveActivity", {
			extra: { workoutId: payload?.workoutId },
		});
	}
}
