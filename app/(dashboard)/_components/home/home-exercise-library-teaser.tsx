"use client";

import Link from "next/link";

import { Dumbbell } from "lucide-react";

import { ROUTES } from "@/lib/consts";

type HomeExerciseLibraryTeaserProps = {
	count: number | null;
	isLoading: boolean;
};

function formatExerciseCountLabel(count: number): string {
	return `${count.toLocaleString()} ${count === 1 ? "Exercise" : "Exercises"}`;
}

export function HomeExerciseLibraryTeaser({ count, isLoading }: HomeExerciseLibraryTeaserProps) {
	const label =
		isLoading || count === null ? (
			<span
				className="inline-block h-8 w-36 animate-pulse rounded-lg bg-white/20"
				aria-busy={isLoading}
				aria-label="Loading exercise count"
			/>
		) : (
			formatExerciseCountLabel(count)
		);

	return (
		<div className="pb-8">
			<Link
				href={ROUTES.EXERCISES}
				className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-gray-800 to-gray-900 p-5 transition-opacity hover:opacity-95 active:scale-[0.99] dark:from-gray-700 dark:to-gray-800"
				aria-label="Open exercise library"
			>
				<div>
					<p className="text-sm text-white/60">Exercise Library</p>
					<p className="text-2xl font-bold text-white">{label}</p>
				</div>
				<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
					<Dumbbell className="h-6 w-6 text-white" aria-hidden />
				</div>
			</Link>
		</div>
	);
}
