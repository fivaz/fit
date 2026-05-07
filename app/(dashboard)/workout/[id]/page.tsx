import * as React from "react";

import { WorkoutDetail } from "@/components/workout/workout-detail";
import { WorkoutNotFound } from "@/components/workout/workout-not-found";
import { getUserId } from "@/lib/utils-server";
import { getWorkoutById } from "@/lib/workout/service";

type ProgramPageProps = {
	params: Promise<{ id: string }>;
};

export default async function WorkoutPage({ params }: ProgramPageProps) {
	const { id } = await params;
	const userId = await getUserId();

	const workout = await getWorkoutById(id, userId);

	if (!workout) {
		return <WorkoutNotFound />;
	}

	return <WorkoutDetail initialWorkout={workout} />;
}
