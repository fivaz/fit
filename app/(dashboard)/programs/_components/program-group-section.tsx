"use client";

import * as React from "react";

import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { ProgramRow } from "@/app/(dashboard)/programs/_components/program-row";
import { useProgramMutations, useProgramsStore } from "@/hooks/program/store";
import { reorderPrograms } from "@/lib/program/api";
import { ProgramUI } from "@/lib/program/type";
import { sectionGroupId } from "@/lib/programs/grouping";
import { readProgramsUiPrefs, setGroupCollapsed } from "@/lib/programs/ui-preferences";
import { cn, sameOrder } from "@/lib/utils";

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
	const { items: allPrograms } = useProgramsStore();
	const { setItems } = useProgramMutations();
	const [isCollapsed, setIsCollapsed] = React.useState(() =>
		readProgramsUiPrefs().collapsedGroupIds.includes(sectionId),
	);

	const toggleCollapsed = () => {
		const nextCollapsed = !isCollapsed;
		setIsCollapsed(nextCollapsed);
		setGroupCollapsed(sectionId, nextCollapsed);
	};

	function handleReorder(event: Parameters<typeof move>[1]) {
		const reordered = move(programs, event).map((program, order) => ({ ...program, order }));

		if (sameOrder(programs, reordered)) return;

		setItems(
			allPrograms.map((program) => {
				const reorderedProgram = reordered.find((item) => item.id === program.id);
				return reorderedProgram ?? program;
			}),
			{
				persist: () =>
					reorderPrograms(
						sectionGroupId(sectionId),
						reordered.map((program) => program.id),
					),
				onError: () => toast.error("Failed to reorder programs. Reverting."),
			},
		);
	}

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
				<DragDropProvider onDragEnd={handleReorder}>
					<div className="flex flex-col gap-4">
						{programs.length === 0 ? (
							<p className="text-muted-foreground px-1 text-sm">No programs in this group yet.</p>
						) : (
							programs.map((program, index) => (
								<ProgramRow
									key={program.id}
									program={program}
									index={index}
									onOpen={onOpenProgram}
								/>
							))
						)}
					</div>
				</DragDropProvider>
			)}
		</section>
	);
}
