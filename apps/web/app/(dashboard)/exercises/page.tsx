"use client";

import * as React from "react";
import { useEffect, useState } from "react";

import { ExerciseLibraryList } from "@/app/(dashboard)/exercises/_components/exercise-library-list";
import { useOfflineCache } from "@/hooks/offline/use-offline-cache";
import { getExercises } from "@/lib/exercise/api";
import { ExerciseUI } from "@/lib/exercise/type";
import type { OfflineSnapshot } from "@/lib/offline/data-adapters";

const NO_EXERCISES: ExerciseUI[] = [];

function selectCachedExercises(snapshot: OfflineSnapshot): ExerciseUI[] {
	return snapshot.exercises;
}

export default function ExercisesPage() {
	// Saved copies show right away; the API's answer replaces them once it arrives.
	const cachedExercises = useOfflineCache(selectCachedExercises, NO_EXERCISES);
	const [loadedExercises, setLoadedExercises] = useState<ExerciseUI[] | null>(null);
	const exercises = loadedExercises ?? cachedExercises;

	useEffect(() => {
		void getExercises().then(setLoadedExercises);
	}, []);

	return (
		<div className="relative flex w-full flex-col">
			{/* Header */}
			<div className="flex items-start justify-between pb-4">
				<div>
					<h1 className="text-foreground text-2xl font-bold">Exercises</h1>
					<p className="text-muted-foreground mt-1 text-sm">
						{/*TODO add something else*/}
						{exercises.length} exercises in library
					</p>
				</div>
			</div>
			<ExerciseLibraryList initialExercises={exercises} />
		</div>
	);
}
