"use client";

import * as React from "react";

import { useSortable } from "@dnd-kit/react/sortable";
import { GripVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProgramUI } from "@/lib/program/type";
import { cn } from "@/lib/utils";

type ProgramRowProps = {
	program: ProgramUI;
	index: number;
	onOpen: (programId: string) => void;
};

export function ProgramRow({ program, index, onOpen }: ProgramRowProps) {
	const { ref, handleRef, isDragging } = useSortable({ id: program.id, index });

	return (
		<div ref={ref} className={cn("relative block", isDragging && "z-50")}>
			<Card
				className={cn(
					"group ring-chart-1 relative h-32 overflow-hidden rounded-2xl p-0 transition-all hover:ring-1",
					{ "border-orange-500 bg-orange-50/50 shadow-lg": isDragging },
				)}
			>
				<button
					ref={handleRef}
					type="button"
					className="text-primary absolute top-0 left-0 z-30 cursor-grab p-3 hover:text-orange-600 active:cursor-grabbing"
					aria-label={`Drag ${program.name} to reorder`}
				>
					<GripVertical className="size-5" />
				</button>
				<img
					src={program.imageUrl || "/exercise.jpg"}
					alt=""
					className="h-full w-full object-cover transition-transform group-hover:scale-105"
				/>
				<div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end bg-linear-to-t from-black/80 via-transparent to-transparent p-4">
					<h3 className="text-lg font-bold text-white">{program.name}</h3>
					<div className="mt-1 flex flex-wrap gap-1">
						{program.muscles.map((muscle) => (
							<Badge key={muscle} className="h-5 px-2 py-0 text-[10px] capitalize">
								{muscle}
							</Badge>
						))}
					</div>
				</div>
				<button
					type="button"
					className="ring-chart-1 absolute inset-0 z-20 cursor-pointer rounded-2xl transition-all ring-inset hover:ring-1 focus-visible:ring-2 focus-visible:outline-none"
					aria-label={`Open program ${program.name}`}
					onClick={() => onOpen(program.id)}
				/>
			</Card>
		</div>
	);
}
