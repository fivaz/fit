import * as React from "react";

import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExercisesPageLoading() {
	return (
		<div className="relative">
			<div className="flex items-start justify-between pb-4">
				<div>
					<h1 className="text-foreground text-2xl font-bold">Exercises</h1>
					<div className="text-muted-foreground mt-1 flex gap-2 text-sm">
						<Skeleton className="h-6 w-10 bg-gray-400/20 dark:bg-gray-700/60" /> exercises in your
						library
					</div>
				</div>
			</div>
			<ExerciseListLoading />
		</div>
	);
}

export function ExerciseFilterSkeleton() {
	return (
		<>
			{/* Search Section Skeleton */}
			<div className="mb-4">
				<div className="relative">
					{/* We use a slightly rounded-xl height matching your Input (h-10 is standard) */}
					<Skeleton className="h-10 w-full rounded-xl bg-gray-400/20 dark:bg-gray-700/60" />
				</div>
			</div>

			{/* Filter Section Skeleton */}
			<div className="mb-6 flex gap-3 overflow-hidden pb-2">
				{/* We render a few pills of different widths to look more realistic */}
				{[60, 80, 70, 90, 65].map((width, i) => (
					<Skeleton
						key={i}
						className="h-9 shrink-0 rounded-full bg-gray-400/20 dark:bg-gray-700/60"
						style={{ width: `${width}px` }}
					/>
				))}
			</div>
		</>
	);
}

function ExerciseListLoading() {
	return (
		<>
			<div className="absolute top-0 right-0">
				<Button disabled size="icon-lg">
					<PlusIcon className="size-5" />
				</Button>
			</div>

			<div className="space-y-4 pb-6">
				<ExerciseFilterSkeleton />
				<div className="flex flex-col gap-4">
					{Array.from({ length: 5 }).map((_, i) => (
						<ExerciseRowSkeleton key={i} />
					))}
				</div>
			</div>
		</>
	);
}

export function ExerciseRowSkeleton() {
	return (
		<Card className="relative h-24 overflow-hidden rounded-2xl border-none bg-white p-0 dark:bg-gray-700/60">
			<CardHeader>
				{/* Mimic the Image Background */}
				<Skeleton className="h-full w-full" />

				{/* Mimic the Content Overlay */}
				<div className="absolute inset-0 z-10 flex flex-col justify-end p-4">
					{/* Title Skeleton */}
					<Skeleton className="h-6 w-3/4 bg-gray-400/20 dark:bg-white/20" />

					{/* Badges Skeleton */}
					<div className="mt-2 flex gap-1">
						<Skeleton className="h-5 w-12 bg-gray-400/20 dark:bg-white/20" />
						<Skeleton className="h-5 w-16 bg-gray-400/20 dark:bg-white/20" />
						<Skeleton className="h-5 w-10 bg-gray-400/20 dark:bg-white/20" />
					</div>
				</div>
			</CardHeader>
		</Card>
	);
}
