"use client";

import { WorkoutDetail } from "@/components/workout/workout-detail";
import { useActiveWorkoutHome } from "@/hooks/workout/active-workout-home";

function HomePlaceholder() {
	return (
		<div className="relative flex w-full flex-col">
			<div className="flex items-start justify-between pb-4">
				<div>
					<h1 className="text-foreground text-2xl font-bold">Home</h1>
					<small className="mt-1 text-red-500">(not implemented yet)</small>
				</div>
			</div>
		</div>
	);
}

export default function HomePage() {
	const { activeWorkout } = useActiveWorkoutHome();

	if (activeWorkout === undefined) {
		return <div className="py-8 text-sm text-gray-500">Loading...</div>;
	}

	if (activeWorkout) {
		return <WorkoutDetail initialWorkout={activeWorkout} />;
	}

	return <HomePlaceholder />;
}
