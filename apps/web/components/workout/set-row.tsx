import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

import { motion } from "framer-motion";
import { DumbbellIcon, ThermometerSunIcon, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { TimeInput } from "@/components/workout/time-input";
import { useConfirm } from "@/hooks/confirm/use-confirm";
import { cn } from "@/lib/utils";
import { SetUI, WorkoutSetMap } from "@/lib/workout/type";

type SetRowProps = {
	exerciseId: string;
	set: SetUI;
	isPending: boolean;
	index: number;
	setExerciseSets: Dispatch<SetStateAction<WorkoutSetMap>>;
};

export function SetRow({ index, isPending, setExerciseSets, exerciseId, set }: SetRowProps) {
	const [showIcon, setShowIcon] = useState(false);
	const iconTimerRef = useRef<NodeJS.Timeout | null>(null);
	const confirm = useConfirm();

	useEffect(() => {
		return () => {
			if (iconTimerRef.current) clearTimeout(iconTimerRef.current);
		};
	}, []);

	const patchSet = <K extends keyof SetUI>(field: K, value: SetUI[K]) => {
		setExerciseSets((map) => ({
			...map,
			[exerciseId]: (map[exerciseId] ?? []).map((s) =>
				s.id === set.id ? { ...s, [field]: value } : s,
			),
		}));
	};

	const handleToggleWarmup = () => {
		patchSet("isWarmup", !set.isWarmup);

		if (iconTimerRef.current) clearTimeout(iconTimerRef.current);
		setShowIcon(true);
		iconTimerRef.current = setTimeout(() => setShowIcon(false), 1000);
	};

	async function handleRemoveSet() {
		if (set.time || set.reps || set.weight) {
			const confirmed = await confirm({
				title: "Delete Set",
				message: "This set has data. Are you sure you want to delete it?",
			});
			if (!confirmed) return;
		}

		setExerciseSets((map) => ({
			...map,
			[exerciseId]: (map[exerciseId] ?? []).filter((s) => s.id !== set.id),
		}));
	}

	return (
		<motion.div
			key={set.id}
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, x: -20 }}
			layout
			className="mb-2 grid grid-cols-[40px_1fr_1fr_1fr_40px] gap-2"
		>
			{/* Toggle Warmup */}
			<button
				type="button"
				aria-label="Toggle warmup set"
				onClick={handleToggleWarmup}
				disabled={isPending}
				className="flex cursor-pointer items-center justify-center transition-transform active:scale-95"
			>
				<div
					className={cn(
						"flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold transition-all duration-300",
						set.isWarmup
							? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
							: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
					)}
				>
					{showIcon ? (
						set.isWarmup ? (
							<ThermometerSunIcon className="animate-in zoom-in size-4" />
						) : (
							<DumbbellIcon className="animate-in zoom-in size-4" />
						)
					) : (
						<span className="animate-in fade-in duration-500">{index + 1}</span>
					)}
				</div>
			</button>

			{/* Reps */}
			<Input
				type="number"
				value={set.reps || ""}
				onChange={(e) => patchSet("reps", Number(e.target.value))}
				className="h-10 border-gray-200 bg-gray-50 text-center dark:border-gray-600 dark:bg-gray-700"
			/>

			{/* Weight */}
			<Input
				type="number"
				value={set.weight || ""}
				onChange={(e) => patchSet("weight", parseFloat(e.target.value))}
				className="h-10 border-gray-200 bg-gray-50 text-center dark:border-gray-600 dark:bg-gray-700"
			/>

			{/* Time (Extracted) */}
			<TimeInput
				value={set.time}
				onUpdate={(date) => patchSet("time", date)}
				isPending={isPending}
			/>

			{/* Delete */}
			<button
				type="button"
				aria-label="Delete set"
				onClick={handleRemoveSet}
				className="flex items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
			>
				<Trash2 className="h-4 w-4" />
			</button>
		</motion.div>
	);
}
