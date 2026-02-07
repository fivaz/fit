import { Checkbox } from "@/components/ui/checkbox";
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
	return (
		<div
			onClick={onToggle}
			className={cn(
				"group relative flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-3 transition-all active:scale-[0.98]",
				isSelected
					? "border-orange-500 bg-orange-50/50 shadow-sm"
					: "bg-muted/40 hover:bg-muted border-transparent",
			)}
		>
			<div className="flex items-center gap-3">
				{/* Thumbnail: Smaller and rounded */}
				<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border">
					<img
						src={exercise.imageUrl || "/exercise.jpg"}
						alt={exercise.name}
						className="h-full w-full object-cover"
					/>
				</div>

				{/* Text content: Stacked vertically */}
				<div className="flex flex-col">
					<h3
						className={cn(
							"mb-1 text-sm leading-none font-semibold capitalize",
							isSelected ? "text-orange-900" : "text-foreground",
						)}
					>
						{exercise.name}
					</h3>
					<p className="text-muted-foreground text-xs capitalize">{exercise.muscles.join(", ")}</p>
				</div>
			</div>

			{/* Checkbox: Visual confirmation */}
			<div className="flex items-center pr-1">
				<Checkbox
					checked={isSelected}
					onCheckedChange={onToggle}
					className={cn(
						"border-muted-foreground h-5 w-5 rounded-full",
						isSelected && "border-orange-500 bg-orange-500 text-white",
					)}
				/>
			</div>
		</div>
	);
}
