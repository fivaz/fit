"use client";

import { ProgramEmptyState } from "@/app/(dashboard)/programs/_components/program-empty-state";
import { ProgramsListInternal } from "@/app/(dashboard)/programs/_components/programs-list-internal";
import { useProgramsStore } from "@/hooks/program/store";
import { useProgramGroupsStore } from "@/hooks/program-group/store";

type ProgramsListProps = {
	onOpenProgram: (programId: string) => void;
};

export function ProgramList({ onOpenProgram }: ProgramsListProps) {
	const { items: programs } = useProgramsStore();
	const { items: groups } = useProgramGroupsStore();

	return (
		<div className="space-y-6 pb-6">
			{programs.length === 0 && groups.length === 0 ? (
				<ProgramEmptyState />
			) : (
				<ProgramsListInternal onOpenProgram={onOpenProgram} />
			)}
		</div>
	);
}
