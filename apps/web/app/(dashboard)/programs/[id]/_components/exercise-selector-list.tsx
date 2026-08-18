"use client";

import * as React from "react";
import { useEffect } from "react";

import { useIntersectionObserver } from "usehooks-ts";

import { ExerciseSelectorItem } from "@/app/(dashboard)/programs/[id]/_components/exercise-selector-item";
import { ExerciseFilterShell, NoResultsFound } from "@/components/exercise/exercise-filter-shell";
import { ExerciseFormButton } from "@/components/exercise/exercise-form-button";
import { useExerciseFilters } from "@/hooks/exercise/use-exercise-filters";
import { ExerciseUI } from "@/lib/exercise/type";
import { MuscleGroupType } from "@/lib/muscle/type";

interface ExerciseSelectorListProps {
	muscles: MuscleGroupType[];
	selected: ExerciseUI[];
	onToggle: (exercise: ExerciseUI) => void;
}

export function ExerciseSelectorList({ selected, onToggle, muscles }: ExerciseSelectorListProps) {
	const filterData = useExerciseFilters(muscles);
	const { isLoading, hasNextPage, fetchNextPage, filteredExercises } = filterData;

	const { isIntersecting, ref: bottomRef } = useIntersectionObserver({ threshold: 0.1 });

	useEffect(() => {
		if (isIntersecting && hasNextPage && !isLoading) {
			fetchNextPage();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isIntersecting, hasNextPage, isLoading]);

	const sortedExercises = filteredExercises.toSorted((a, b) => a.name.localeCompare(b.name));

	return (
		<div className="relative pt-2">
			{/* Floating action button stays consistent */}
			<div className="absolute -top-12 right-0">
				<ExerciseFormButton variant="ghost" size="sm" />
			</div>

			<div className="space-y-4">
				<ExerciseFilterShell {...filterData} />

				<div className="flex flex-col gap-3">
					{sortedExercises.length > 0
						? sortedExercises.map((exercise) => (
								<ExerciseSelectorItem
									key={exercise.id}
									exercise={exercise}
									isSelected={selected.some(({ id }) => id === exercise.id)}
									onToggle={() => onToggle(exercise)}
								/>
							))
						: !isLoading && <NoResultsFound />}
				</div>
				<div ref={bottomRef} className="flex h-20 items-center justify-center">
					{isLoading && (
						<p className="text-muted-foreground animate-pulse text-sm">Loading more exercises...</p>
					)}
					{!isLoading && !hasNextPage && sortedExercises.length > 0 && (
						<p className="text-muted-foreground text-sm italic">End of list.</p>
					)}
				</div>
			</div>
		</div>
	);
}
