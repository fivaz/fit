import * as React from "react";
import { useState } from "react";

import { useSortable } from "@dnd-kit/react/sortable";
import { GripVertical } from "lucide-react";

import { ExerciseDetails } from "@/app/(dashboard)/exercises/_components/exercise-details";
import { ExerciseFormButton } from "@/components/exercise/exercise-form-button";
import { Card } from "@/components/ui/card";
import { ExerciseUI } from "@/lib/exercise/type";
import { cn } from "@/lib/utils";

type ProgramExerciseRowProps = {
	exercise: ExerciseUI;
	index: number;
};

export function ProgramExerciseRow({ exercise, index }: ProgramExerciseRowProps) {
	const { ref, handleRef, isDragging } = useSortable({
		id: exercise.id,
		index,
	});
	const [showForm, setShowForm] = useState(false);

	return (
		<Card
			ref={ref}
			className={cn(
				"group relative cursor-pointer overflow-hidden rounded-2xl bg-white p-0 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-gray-800",
				{ "z-50 scale-[1.02] shadow-lg ring-2 ring-orange-400/40": isDragging },
			)}
		>
			<div className="flex items-stretch">
				{/* Drag Handle */}
				<button
					type="button"
					aria-label="Drag exercise to reorder"
					ref={handleRef}
					className="flex cursor-grab items-center bg-gray-100 px-3 active:cursor-grabbing dark:bg-gray-700/50"
				>
					<GripVertical className="h-5 w-5 text-gray-400" />
				</button>

				{/* Content */}
				{/* Added 'min-w-0' here so the flex child can shrink smaller than its content, it's necessary for the truncate */}
				<button
					type="button"
					aria-label={`Open exercise ${exercise.name}`}
					className="flex min-w-0 flex-1 cursor-pointer items-center gap-4 p-4 text-left"
					onClick={() => setShowForm(true)}
				>
					<div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
						<img
							src={exercise.imageUrl || "/exercise.jpg"}
							alt={exercise.name}
							className="h-full w-full object-cover"
						/>
					</div>

					<div className="min-w-0 flex-1">
						<h3 className="block truncate font-semibold text-gray-900 capitalize dark:text-white">
							{exercise.name}
						</h3>
						<p className="mt-0.5 block truncate text-sm text-gray-500 capitalize dark:text-gray-400">
							{exercise.muscles.join(", ")}
						</p>
					</div>
				</button>
				{exercise.isPrivate ? (
					<ExerciseFormButton exercise={exercise} open={showForm} onOpenChange={setShowForm} />
				) : (
					<ExerciseDetails exercise={exercise} open={showForm} setOpen={setShowForm} />
				)}
			</div>
		</Card>
	);
}
