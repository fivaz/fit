"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

type ProgressHeaderProps = {
	onLogWorkout: () => void;
};

export function ProgressHeader({ onLogWorkout }: ProgressHeaderProps) {
	return (
		<div className="mb-6 flex items-center justify-between">
			<div>
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Progress</h1>
				<p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
					Last 7 days · track your fitness journey
				</p>
			</div>
			<Button
				onClick={onLogWorkout}
				size="icon"
				aria-label="Log workout"
				className="h-11 w-11 rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600"
			>
				<Plus className="h-5 w-5" />
			</Button>
		</div>
	);
}
