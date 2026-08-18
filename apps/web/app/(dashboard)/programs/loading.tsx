import * as React from "react";

import { ProgramFormButton } from "@/components/program/program-form-button";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProgramsPageLoading() {
	return (
		<div className="relative">
			<div className="flex items-start justify-between pb-4">
				<div>
					<h1 className="text-foreground text-2xl font-bold">Programs</h1>
					<div className="text-muted-foreground mt-1 flex gap-2 text-sm">
						<Skeleton className="h-6 w-10 bg-gray-400/20 dark:bg-white/20" /> workout programs
					</div>
				</div>
				<ProgramFormButton size="icon-lg" disabled />
			</div>
			<ProgramListLoading />
		</div>
	);
}

function ProgramListLoading() {
	return (
		<div className="space-y-4 pb-6">
			<div className="flex flex-col gap-4">
				{Array.from({ length: 5 }).map((_, i) => (
					<ProgramRowSkeleton key={i} />
				))}
			</div>
		</div>
	);
}

export function ProgramRowSkeleton() {
	return (
		<Card className="relative h-32 overflow-hidden rounded-2xl border-none bg-white p-0 dark:bg-gray-700/80">
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
