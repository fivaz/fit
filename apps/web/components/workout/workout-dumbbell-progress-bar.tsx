"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Dumbbell } from "lucide-react";

const ICON_SIZE = 30;
const TRACK_HEIGHT = 10;
const PROGRESS_ORANGE = "#FF6100";
const PROGRESS_HIGHLIGHT = "#FFA81F";

type WorkoutDumbbellProgressBarProps = {
	progress: number;
	setsDone: number;
	/** When set, animates from this value to `progress` on mount/update. */
	animateFrom?: number;
	durationMs?: number;
};

export function WorkoutDumbbellProgressBar({
	progress,
	setsDone,
	animateFrom,
	durationMs = 450,
}: WorkoutDumbbellProgressBarProps) {
	const reduceMotion = useReducedMotion();
	const clamped = Math.min(1, Math.max(0, progress));
	const from = animateFrom != null ? Math.min(1, Math.max(0, animateFrom)) : clamped;
	const duration = reduceMotion ? 0 : durationMs / 1000;
	const showFill = clamped > 0 || setsDone > 0;

	return (
		<div className="relative h-[30px] w-full" aria-hidden>
			<div
				className="absolute top-1/2 -translate-y-1/2 rounded-full"
				style={{
					left: ICON_SIZE / 2,
					right: ICON_SIZE / 2,
					height: TRACK_HEIGHT,
					backgroundColor: `${PROGRESS_ORANGE}3D`,
				}}
			/>

			{showFill ? (
				<motion.div
					className="absolute top-1/2 origin-left -translate-y-1/2 rounded-full shadow-[0_0_6px_rgba(255,97,0,0.65)]"
					style={{
						left: ICON_SIZE / 2,
						height: TRACK_HEIGHT,
						width: `calc(100% - ${ICON_SIZE}px)`,
						background: `linear-gradient(90deg, ${PROGRESS_HIGHLIGHT}, ${PROGRESS_ORANGE})`,
					}}
					initial={{ scaleX: from }}
					animate={{ scaleX: clamped }}
					transition={{ duration, ease: "easeOut" }}
				/>
			) : null}

			<motion.div
				className="absolute top-1/2 flex size-[30px] -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_0_6px_rgba(255,97,0,0.55),0_1px_2px_rgba(0,0,0,0.12)] dark:bg-gray-900"
				initial={{ left: `calc((100% - ${ICON_SIZE}px) * ${from})` }}
				animate={{ left: `calc((100% - ${ICON_SIZE}px) * ${clamped})` }}
				transition={{ duration, ease: "easeOut" }}
			>
				<Dumbbell className="size-4 text-[#FF6100]" strokeWidth={2.5} />
			</motion.div>
		</div>
	);
}
