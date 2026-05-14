"use client";

import * as React from "react";

import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { toast } from "sonner";

import { ProgramEmptyState } from "@/app/(dashboard)/programs/_components/program-empty-state";
import { ProgramRow } from "@/app/(dashboard)/programs/_components/program-row";
import { ProgramFormButton } from "@/components/program/program-form-button";
import { useProgramMutations, useProgramsStore } from "@/hooks/program/store";
import { offlineDataAdapters } from "@/lib/offline/data-adapters";
import { reorderPrograms } from "@/lib/program/api";
import { sameOrder } from "@/lib/utils";

type ProgramsListProps = {
	onOpenProgram: (programId: string) => void;
};

export function ProgramList({ onOpenProgram }: ProgramsListProps) {
	const { items: programs } = useProgramsStore();

	React.useEffect(() => {
		offlineDataAdapters.setProgramsLocal(programs);
	}, [programs]);

	return (
		<>
			<div className="absolute top-0 right-0">
				<ProgramFormButton size="icon-lg" />
			</div>

			<div className="space-y-4">
				<ProgramsListInternal onOpenProgram={onOpenProgram} />
			</div>
		</>
	);
}

export function ProgramsListInternal({
	onOpenProgram,
}: {
	onOpenProgram: (programId: string) => void;
}) {
	const { items: programs } = useProgramsStore();
	const { setItems } = useProgramMutations();

	const sortedPrograms = programs.toSorted((a, b) => a.order - b.order);

	if (sortedPrograms.length === 0) return <ProgramEmptyState />;

	function handleReorder(event: Parameters<typeof move>[1]) {
		const reordered = move(sortedPrograms, event).map((program, order) => ({ ...program, order }));

		if (sameOrder(sortedPrograms, reordered)) return;

		setItems(reordered, {
			persist: () => reorderPrograms(reordered.map((p) => p.id)),
			onError: () => toast.error("Failed to reorder programs. Reverting."),
		});
	}

	return (
		<DragDropProvider onDragEnd={handleReorder}>
			<div className="flex flex-col gap-4">
				{sortedPrograms.map((program, index) => (
					<ProgramRow key={program.id} program={program} index={index} onOpen={onOpenProgram} />
				))}
			</div>
		</DragDropProvider>
	);
}
