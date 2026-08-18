"use client";

import { HomePageTemplate } from "@/app/(dashboard)/_components/home/home-page-template";
import { WorkoutDetail } from "@/components/workout/workout-detail";
import { useActiveWorkoutHome } from "@/hooks/workout/active-workout-home";

export default function HomePage() {
	const { activeWorkout } = useActiveWorkoutHome();

	if (activeWorkout === undefined) {
		return <div className="py-8 text-sm text-gray-500">Loading...</div>;
	}

	if (activeWorkout) {
		return <WorkoutDetail initialWorkout={activeWorkout} />;
	}

	return <HomePageTemplate />;
}
