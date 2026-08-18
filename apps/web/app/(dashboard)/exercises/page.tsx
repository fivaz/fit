"use client";

import * as React from "react";
import { useEffect, useState } from "react";

import { ExerciseLibraryList } from "@/app/(dashboard)/exercises/_components/exercise-library-list";
import { getExercises } from "@/lib/exercise/api";
import { ExerciseUI } from "@/lib/exercise/type";

export default function ExercisesPage() {
	const [exercises, setExercises] = useState<ExerciseUI[]>([]);

	useEffect(() => {
		void getExercises().then(setExercises);
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
