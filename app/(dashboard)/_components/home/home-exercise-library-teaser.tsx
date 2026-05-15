"use client";

import { Dumbbell } from "lucide-react";

const MOCK_EXERCISE_COUNT_LABEL = "124 Exercises";

export function HomeExerciseLibraryTeaser() {
	return (
		<div className="pb-8">
			<div className="flex cursor-pointer items-center justify-between rounded-2xl bg-gradient-to-r from-gray-800 to-gray-900 p-5 dark:from-gray-700 dark:to-gray-800">
				<div>
					<p className="text-sm text-white/60">Exercise Library</p>
					<p className="text-2xl font-bold text-white">{MOCK_EXERCISE_COUNT_LABEL}</p>
				</div>
				<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
					<Dumbbell className="h-6 w-6 text-white" />
				</div>
			</div>
		</div>
	);
}
