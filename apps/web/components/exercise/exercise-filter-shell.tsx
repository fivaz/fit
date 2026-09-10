"use client";

import * as React from "react";
import { Dispatch, SetStateAction } from "react";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MuscleGroupType } from "@/lib/muscle/type";

export interface ExerciseFilterShellProps {
	searchQuery: string;
	setSearchQuery: (val: string) => void;
	selectedMuscles: MuscleGroupType[];
	setSelectedMuscles: Dispatch<SetStateAction<MuscleGroupType[]>>;
	availableMuscles: MuscleGroupType[];
}

export function ExerciseFilterShell({
	searchQuery,
	setSearchQuery,
	selectedMuscles,
	setSelectedMuscles,
	availableMuscles,
}: ExerciseFilterShellProps) {
	const toggleMuscle = (muscle: MuscleGroupType) => {
		setSelectedMuscles((muscles) => {
			if (muscles.includes(muscle)) {
				// if last one return all.
				if (muscles.length === 1) return availableMuscles;
				return muscles.filter((m) => m !== muscle);
			} else {
				return [...muscles, muscle];
			}
		});
	};

	const addAllMuscles = () => setSelectedMuscles(availableMuscles);

	const isAllSelected = selectedMuscles.length === availableMuscles.length;

	return (
		<>
			{/* Search Section */}
			<div className="mb-4">
				<div className="relative">
					<Search className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
					<Input
						type="text"
						placeholder="Search exercises..."
						className="rounded-xl pl-12"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			</div>

			{/* Filter Section */}
			<div className="scrollbar-hide mb-6 flex gap-3 overflow-x-auto pb-2">
				<Button
					type="button"
					variant={isAllSelected ? "default" : "outline"}
					className="rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap capitalize"
					onClick={addAllMuscles}
				>
					All
				</Button>
				{availableMuscles.map((muscle) => {
					const isActive = !isAllSelected && selectedMuscles.includes(muscle);

					return (
						<Button
							key={muscle}
							type="button"
							variant={isActive ? "default" : "outline"}
							onClick={() => {
								if (isAllSelected) {
									setSelectedMuscles([muscle]);
									return;
								}
								toggleMuscle(muscle);
							}}
							className="rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap capitalize"
						>
							{muscle}
							{isActive && (
								<span className="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px]">
									<X className="h-3 w-3" />
								</span>
							)}
						</Button>
					);
				})}
			</div>
		</>
	);
}

export function NoResultsFound() {
	return (
		<div className="text-muted-foreground rounded-xl border-2 border-dashed py-10 text-center">
			No exercises match your filters.
		</div>
	);
}
