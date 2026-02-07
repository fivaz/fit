import { useState } from "react";

import { ExerciseDetails } from "@/app/(dashboard)/exercises/_components/exercise-details";
import { ExerciseUI } from "@/lib/exercise/type";
import { cn } from "@/lib/utils";

type ExerciseSelectorItemProps = {
	exercise: ExerciseUI;
	isSelected: boolean;
	onToggle: () => void;
};

export function ExerciseSelectorItem({
	exercise,
	isSelected,
	onToggle,
}: ExerciseSelectorItemProps) {
	const [showDetails, setShowDetails] = useState(false);

	return (
		<>
			<label
				className={cn(
					"group bg-muted/40 relative flex cursor-pointer items-center gap-4 rounded-xl border border-transparent p-3",
					"hover:bg-muted transition-all active:scale-[0.98]",
					"has-checked:border-orange-500",
				)}
			>
				<div
					onClick={(e) => {
						e.preventDefault(); // It stops the label from toggling the checkbox
						setShowDetails(true);
					}}
					className="relative z-10 h-12 w-12 shrink-0 overflow-hidden rounded-lg border hover:opacity-80"
				>
					<img
						src={exercise.imageUrl || "/exercise.jpg"}
						alt="View details"
						className="h-full w-full object-cover"
					/>
				</div>

				<div className="flex flex-1 items-center justify-between">
					<div className="flex flex-col">
						<h3 className="text-sm font-semibold capitalize group-has-checked:text-orange-500">
							{exercise.name}
						</h3>
						<p className="text-muted-foreground text-xs">{exercise.muscles.join(", ")}</p>
					</div>

					<input
						type="checkbox"
						className="peer sr-only"
						checked={isSelected}
						onChange={onToggle}
					/>

					<div
						className={cn(
							"border-muted-foreground flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
						)}
					>
						{isSelected && <div className="h-2 w-2 rounded-full bg-orange-500" />}
					</div>
				</div>
			</label>

			<ExerciseDetails exercise={exercise} open={showDetails} setOpen={setShowDetails} />
		</>
	);
}
