"use client";

import * as React from "react";
import Link from "next/link";

import { useSortable } from "@dnd-kit/react/sortable";
import { GripVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/lib/consts";
import { ProgramUI } from "@/lib/program/type";
import { cn } from "@/lib/utils";

type ProgramRowProps = {
	program: ProgramUI;
	index: number;
};

export function ProgramRow({ program, index }: ProgramRowProps) {
	const { ref, handleRef, isDragging } = useSortable({ id: program.id, index });

	return (
		<Link
			ref={ref}
			href={`${ROUTES.PROGRAMS}/${program.id}`}
			aria-label={`Open program ${program.name}`}
		>
			<Card
				className={cn(
					"group ring-chart-1 relative h-32 cursor-pointer overflow-hidden rounded-2xl p-0 transition-all hover:ring-1 focus:ring-2 focus:outline-none",
					{ "z-50 border-orange-500 bg-orange-50/50 shadow-lg": isDragging },
				)}
			>
				{/* Handle for drag and drop */}
				<button
					ref={handleRef}
					className="text-primary absolute top-0 left-0 z-20 cursor-grab p-3 hover:text-orange-600 active:cursor-grabbing"
					aria-label="Drag to reorder"
				>
					<GripVertical className="size-5" />
				</button>
				<img
					src={program.imageUrl || "/exercise.jpg"}
					alt={program.name}
					className="h-full w-full object-cover transition-transform group-hover:scale-105"
				/>
				{/* Content */}
				<div className="absolute inset-0 z-10 flex flex-col justify-end bg-linear-to-t from-black/80 via-transparent to-transparent p-4">
					<h3 className="text-lg font-bold text-white">{program.name}</h3>
					<div className="mt-1 flex flex-wrap gap-1">
						{program.muscles.map((muscle) => (
							<Badge key={muscle} className="h-5 px-2 py-0 text-[10px] capitalize">
								{muscle}
							</Badge>
						))}
					</div>
				</div>
			</Card>
		</Link>
	);
}
