import { format } from "date-fns";
import { motion } from "framer-motion";
import { Dumbbell, ThermometerSun } from "lucide-react";

import { cn } from "@/lib/utils";
import { CompletedWorkoutSetEntry } from "@/lib/workout/completed-sets-order";

type WorkoutViewSetRowProps = {
	entry: CompletedWorkoutSetEntry;
	index: number;
};

export function WorkoutViewSetRow({ entry, index }: WorkoutViewSetRowProps) {
	const { set, setNumber, exerciseName, exerciseImageUrl } = entry;
	const formattedTime = format(new Date(set.time!), "HH:mm");

	return (
		<motion.li
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.04 }}
			className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-800"
		>
			<div className="flex w-12 shrink-0 flex-col items-center justify-center">
				<time
					dateTime={new Date(set.time!).toISOString()}
					className="text-sm font-semibold text-green-700 tabular-nums dark:text-green-400"
				>
					{formattedTime}
				</time>
			</div>

			<div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
				<img
					src={exerciseImageUrl || "/exercise.jpg"}
					alt=""
					className="h-full w-full object-cover"
				/>
			</div>

			<div className="min-w-0 flex-1">
				<div className="flex items-start justify-between gap-2">
					<div className="min-w-0">
						<p className="truncate font-semibold text-gray-900 capitalize dark:text-white">
							{exerciseName}
						</p>
						<p className="text-sm text-gray-500 dark:text-gray-400">Set {setNumber}</p>
					</div>
					<div
						className={cn(
							"flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
							set.isWarmup
								? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
								: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
						)}
						aria-label={set.isWarmup ? "Warmup set" : "Working set"}
					>
						{set.isWarmup ? (
							<ThermometerSun className="size-3.5" aria-hidden />
						) : (
							<Dumbbell className="size-3.5" aria-hidden />
						)}
					</div>
				</div>
				<p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
					{set.reps} reps × {set.weight} kg
				</p>
			</div>
		</motion.li>
	);
}
