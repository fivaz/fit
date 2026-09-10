"use client";

import * as React from "react";

import { useDroppable } from "@dnd-kit/react";
import { ChevronDown } from "lucide-react";

import { ProgramRow } from "@/app/(dashboard)/programs/_components/program-row";
import { ProgramUI } from "@/lib/program/type";
import { readProgramsUiPrefs, setGroupCollapsed } from "@/lib/programs/ui-preferences";
import { cn } from "@/lib/utils";

type ProgramGroupSectionProps = {
	sectionId: string;
	name: string;
	programs: ProgramUI[];
	onOpenProgram: (programId: string) => void;
};

export function ProgramGroupSection({
	sectionId,
	name,
	programs,
	onOpenProgram,
}: ProgramGroupSectionProps) {
	const [isCollapsed, setIsCollapsed] = React.useState(() =>
		readProgramsUiPrefs().collapsedGroupIds.includes(sectionId),
	);
	const { ref: droppableRef, isDropTarget } = useDroppable({
		id: sectionId,
		type: "column",
		accept: "item",
		collisionPriority: 1,
	});

	const toggleCollapsed = () => {
		const nextCollapsed = !isCollapsed;
		setIsCollapsed(nextCollapsed);
		setGroupCollapsed(sectionId, nextCollapsed);
	};

	return (
		<section className="space-y-3">
			<button
				type="button"
				className="hover:bg-accent flex w-full items-center gap-2 rounded-lg px-1 py-2 text-left transition-colors"
				aria-label={`${isCollapsed ? "Show" : "Hide"} ${name} group`}
				aria-expanded={!isCollapsed}
				onClick={toggleCollapsed}
			>
				<ChevronDown
					className={cn(
						"text-muted-foreground size-5 shrink-0 transition-transform",
						isCollapsed && "-rotate-90",
					)}
					aria-hidden
				/>
				<span className="text-foreground text-base font-semibold">{name}</span>
				<span className="text-muted-foreground text-sm">
					{programs.length} {programs.length === 1 ? "program" : "programs"}
				</span>
			</button>

			{!isCollapsed && (
				<div
					ref={droppableRef}
					className={cn(
						"flex min-h-16 flex-col gap-4 rounded-lg transition-colors",
						isDropTarget && "bg-accent/40 ring-chart-1 ring-1 ring-inset",
					)}
				>
					{programs.length === 0 ? (
						<p className="text-muted-foreground px-1 text-sm">No programs in this group yet.</p>
					) : (
						programs.map((program, index) => (
							<ProgramRow
								key={program.id}
								program={program}
								index={index}
								sectionId={sectionId}
								onOpen={onOpenProgram}
							/>
						))
					)}
				</div>
			)}
		</section>
	);
}
