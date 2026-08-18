import { Fragment, useState } from "react";

import { CheckCircle2 } from "lucide-react";

import { MUSCLE_GROUPS } from "@/lib/muscle/type";
import { cn } from "@/lib/utils";

import { Label } from "./ui/label";

type MuscleSelectProps = {
	defaultValue?: string[];
};

export function SelectMuscles({ defaultValue = [] }: MuscleSelectProps) {
	const [selectedMuscles, setSelectedMuscles] = useState<string[]>(defaultValue);

	const toggleMuscle = (id: string) => {
		setSelectedMuscles((prev) =>
			prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
		);
	};

	return (
		<div className="grid gap-3">
			<Label>Target Muscle Groups</Label>
			<div className="grid grid-cols-3 gap-3">
				{MUSCLE_GROUPS.map((muscle) => {
					const isSelected = selectedMuscles.includes(muscle.id);
					return (
						<Fragment key={muscle.id}>
							{isSelected && <input type="hidden" name="muscles" value={muscle.id} />}
							<button
								type="button"
								onClick={() => toggleMuscle(muscle.id)}
								className={cn(
									"hover:bg-accent relative flex flex-col items-center gap-2 rounded-xl border-2 p-2 transition-all",
									isSelected
										? "border-orange-500 ring-2 ring-orange-500/20"
										: "bg-muted/50 border-transparent",
								)}
							>
								<div className="aspect-square w-full overflow-hidden rounded-lg bg-white">
									<img
										src={muscle.image}
										alt={muscle.label}
										className="h-full w-full object-cover"
									/>
								</div>
								<span className="text-xs font-medium">{muscle.label}</span>
								{isSelected && (
									<div className="absolute top-1 right-1">
										<CheckCircle2 className="h-4 w-4 fill-orange-500 text-white" />
									</div>
								)}
							</button>
						</Fragment>
					);
				})}
			</div>
		</div>
	);
}
