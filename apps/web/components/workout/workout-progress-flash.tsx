"use client";

import { AnimatePresence, motion } from "framer-motion";

import { WorkoutProgressLiveCard } from "@/components/workout/workout-progress-live-card";
import type { WorkoutProgressFlashSnapshot } from "@/hooks/workout/use-workout-set-completion-flash";

const PROGRESS_ANIM_MS = 450;

type WorkoutProgressFlashProps = {
	flash: WorkoutProgressFlashSnapshot | null;
};

export function WorkoutProgressFlash({ flash }: WorkoutProgressFlashProps) {
	return (
		<div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-[max(3.25rem,env(safe-area-inset-top))]">
			<AnimatePresence mode="wait">
				{flash ? (
					<motion.div
						key={flash.flashKey}
						initial={{ opacity: 0, y: -16, scale: 0.96 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -10, scale: 0.98 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						className="w-full max-w-md"
					>
						<WorkoutProgressLiveCard
							{...flash}
							progressFrom={flash.progressFrom}
							progressAnimateMs={PROGRESS_ANIM_MS}
						/>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}
