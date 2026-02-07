import React, { Dispatch, SetStateAction, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { Info, Plus } from "lucide-react";

import { ExerciseDetails } from "@/app/(dashboard)/exercises/_components/exercise-details"; // Ensure path is correct
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SetRow } from "@/components/workout/set-row";
import { WorkoutWithMappedSets } from "@/lib/workout/actions";
import { getEmptySet, SetUI, WorkoutSetMap } from "@/lib/workout/type";


type ExerciseCardProps = {
	exercise: WorkoutWithMappedSets["exercises"][number];
	index: number;
	sets: SetUI[];
	setExerciseSets: Dispatch<SetStateAction<WorkoutSetMap>>;
	isPending: boolean;
};


export function ExerciseCard({
	exercise,
	index,
	sets,
	setExerciseSets,
	isPending,
}: ExerciseCardProps) {
	const [showDetails, setShowDetails] = useState(false);

	function addSet() {
		setExerciseSets((map) => {
			const current = map[exercise.id] ?? [];
			return { ...map, [exercise.id]: [...current, getEmptySet(current.length)] };
		});
	}

	return (
		<>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: index * 0.1 }}
				className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-gray-800"
			>
				{/* Exercise Banner */}
				<div className="relative h-20 overflow-hidden">
					<img
						src={exercise.exercise.imageUrl || "/exercise.jpg"}
						alt={exercise.exercise.name}
						className="h-full w-full object-cover"
					/>
					<div className="absolute inset-0 bg-linear-to-r from-black/60 to-transparent" />

					{/* 2. Info Button in the top right */}
					<button
						type="button"
						onClick={() => setShowDetails(true)}
						className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-all hover:bg-black/40 active:scale-90"
						aria-label="View exercise details"
					>
						<Info className="size-4" />
					</button>

					<h3 className="absolute bottom-3 left-4 text-lg font-semibold text-white capitalize">
						{exercise.exercise.name}
					</h3>
				</div>

			<div className="p-4">
				{/* Header Row */}
				<div className="mb-2 grid grid-cols-[40px_1fr_1fr_1fr_40px] gap-2">
					<TooltipProvider>
						<div className="flex items-center justify-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400">
							SET
							<Tooltip delayDuration={300}>
								<TooltipTrigger asChild>
									<button
										type="button"
										className="cursor-help transition-colors hover:text-orange-500"
									>
										<Info className="size-3" />
										<span className="sr-only">Set info</span>
									</button>
								</TooltipTrigger>
								<TooltipContent
									side="top"
									className="max-w-52 border-gray-200 bg-white/95 px-3 py-2 text-xs text-gray-600 shadow-xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/95 dark:text-gray-300"
								>
									<p className="leading-relaxed">
										Tap the set number to toggle between{" "}
										<strong className="font-bold text-orange-600 dark:text-orange-400">
											Normal
										</strong>{" "}
										and{" "}
										<strong className="font-bold text-blue-600 dark:text-blue-400">Warmup</strong>{" "}
										sets.
									</p>
								</TooltipContent>
							</Tooltip>
						</div>
					</TooltipProvider>

					{["REPS", "WEIGHT", "TIME"].map((label) => (
						<div
							key={label}
							className="flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400"
						>
							{label}
						</div>
					))}
					<div />
				</div>

					<AnimatePresence mode="popLayout">
						{sets.map((set, index) => (
							<SetRow
								key={set.id}
								set={set}
								index={index}
								setExerciseSets={setExerciseSets}
								exerciseId={exercise.id}
								isPending={isPending}
							/>
						))}
					</AnimatePresence>

					<Button
						variant="outline"
						onClick={addSet}
						className="mt-2 w-full border-2 border-dashed border-gray-300 text-gray-600 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-orange-500 dark:hover:bg-orange-900/20 dark:hover:text-orange-400"
						disabled={isPending}
					>
						<Plus className="mr-2 h-4 w-4" />
						Add Set
					</Button>
				</div>
			</motion.div>

			{/* 3. The Details Component */}
			<ExerciseDetails exercise={exercise.exercise} open={showDetails} setOpen={setShowDetails} />
		</>
	);
}
