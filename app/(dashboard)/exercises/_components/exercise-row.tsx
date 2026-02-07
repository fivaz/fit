import { useState } from "react";

import { ExerciseFormButton } from "@/components/exercise/exercise-form-button";
import { ExerciseUI } from "@/lib/exercise/type";

import { ExerciseDetails } from "./exercise-details";

type ExerciseRowProps = {
	exercise: ExerciseUI;
};

export function ExerciseRow({ exercise }: ExerciseRowProps) {
	const [showForm, setShowForm] = useState(false);

	return (
		<>
			<button
				onClick={() => setShowForm(true)}
				className="group ring-chart-1 relative h-24 cursor-pointer overflow-hidden rounded-2xl text-left hover:ring-2 focus:ring-2 focus:outline-none"
			>
				<img
					src={exercise.imageUrl || "/exercise.jpg"}
					alt={exercise.name}
					className="h-full w-full object-cover transition-transform group-hover:scale-105"
				/>
				<div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/90 to-black/20 p-4">
					<h3 className="text-lg font-bold text-white capitalize">{exercise.name}</h3>
					<p className="text-sm text-white capitalize">{exercise.muscles.join(", ")}</p>
				</div>
			</button>
			{exercise.isPrivate ? (
				<ExerciseFormButton exercise={exercise} open={showForm} onOpenChange={setShowForm} />
			) : (
				<ExerciseDetails exercise={exercise} open={showForm} setOpen={setShowForm} />
			)}
		</>
	);
}
