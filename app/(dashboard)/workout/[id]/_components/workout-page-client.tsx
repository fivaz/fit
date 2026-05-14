"use client";

import { useEffect, useState } from "react";

import { WorkoutDetail } from "@/components/workout/workout-detail";
import { WorkoutNotFound } from "@/components/workout/workout-not-found";
import { getWorkoutById } from "@/lib/workout/api";
import { WorkoutWithMappedSets } from "@/lib/workout/type";

type WorkoutPageClientProps = {
	workoutId: string;
};

export function WorkoutPageClient({ workoutId }: WorkoutPageClientProps) {
	const [workout, setWorkout] = useState<WorkoutWithMappedSets | null | undefined>(undefined);

	useEffect(() => {
		let isCurrent = true;

		void getWorkoutById(workoutId)
			.then((loadedWorkout) => {
				if (isCurrent) setWorkout(loadedWorkout);
			})
			.catch(() => {
				if (isCurrent) setWorkout(null);
			});

		return () => {
			isCurrent = false;
		};
	}, [workoutId]);

	if (workout === undefined) {
		return <div className="px-5 py-8 text-sm text-gray-500">Loading workout...</div>;
	}

	if (!workout) {
		return <WorkoutNotFound />;
	}

	return <WorkoutDetail initialWorkout={workout} />;
}
