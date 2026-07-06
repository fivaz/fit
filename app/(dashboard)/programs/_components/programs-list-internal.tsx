"use client";

import * as React from "react";

import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { toast } from "sonner";

import { ProgramGroupSection } from "@/app/(dashboard)/programs/_components/program-group-section";
import { useProgramMutations, useProgramsStore } from "@/hooks/program/store";
import { useProgramGroupsStore } from "@/hooks/program-group/store";
import { reorderPrograms } from "@/lib/program/api";
import {
	dragStateToPrograms,
	dragStateToSections,
	getChangedSections,
	ProgramDragState,
	sectionsToDragState,
} from "@/lib/programs/drag-utils";
import { buildProgramSections, sectionGroupId } from "@/lib/programs/grouping";

type DragEndEvent = Parameters<
	NonNullable<React.ComponentProps<typeof DragDropProvider>["onDragEnd"]>
>[0];

type ProgramsListInternalProps = {
	onOpenProgram: (programId: string) => void;
};

export function ProgramsListInternal({ onOpenProgram }: ProgramsListInternalProps) {
	const { items: programs } = useProgramsStore();
	const { setItems } = useProgramMutations();
	const { items: groups } = useProgramGroupsStore();
	const sections = buildProgramSections(groups, programs);
	const [dragState, setDragState] = React.useState<ProgramDragState | null>(null);
	const dragSnapshotRef = React.useRef<ProgramDragState | null>(null);
	const dragStateRef = React.useRef<ProgramDragState | null>(null);
	const displaySections = dragState ? dragStateToSections(dragState, sections) : sections;

	if (programs.length === 0 && groups.length === 0) return null;

	function handleDragStart() {
		const snapshot = sectionsToDragState(sections);
		dragSnapshotRef.current = snapshot;
		dragStateRef.current = snapshot;
		setDragState(snapshot);
	}

	function handleDragOver(event: Parameters<typeof move>[1]) {
		const { source } = event.operation;
		if (source?.type === "column") return;

		setDragState((currentState) => {
			if (!currentState) return currentState;

			const nextState = move(currentState, event);
			dragStateRef.current = nextState;
			return nextState;
		});
	}

	function handleDragEnd(event: DragEndEvent) {
		const snapshot = dragSnapshotRef.current;
		const finalState = dragStateRef.current;
		dragSnapshotRef.current = null;
		dragStateRef.current = null;
		setDragState(null);

		if (event.canceled || !snapshot || !finalState) return;

		const changedSections = getChangedSections(snapshot, finalState);
		if (changedSections.length === 0) return;

		const nextPrograms = dragStateToPrograms(finalState, programs);

		setItems(nextPrograms, {
			persist: async () => {
				for (const sectionId of changedSections) {
					await reorderPrograms(sectionGroupId(sectionId), finalState[sectionId] ?? []);
				}
			},
			onError: () => toast.error("Failed to reorder programs. Reverting."),
		});
	}

	return (
		<DragDropProvider
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
		>
			<div className="space-y-6">
				{displaySections.map((section) => (
					<ProgramGroupSection
						key={section.id}
						sectionId={section.id}
						name={section.name}
						programs={section.programs}
						onOpenProgram={onOpenProgram}
					/>
				))}
			</div>
		</DragDropProvider>
	);
}
