"use client";

import * as React from "react";

import { ProgramEmptyState } from "@/app/(dashboard)/programs/_components/program-empty-state";
import { ProgramGroupSection } from "@/app/(dashboard)/programs/_components/program-group-section";
import { useProgramsStore } from "@/hooks/program/store";
import { useProgramGroupsStore } from "@/hooks/program-group/store";
import { offlineDataAdapters } from "@/lib/offline/data-adapters";
import { buildProgramSections } from "@/lib/programs/grouping";

type ProgramsListProps = {
	onOpenProgram: (programId: string) => void;
};

export function ProgramList({ onOpenProgram }: ProgramsListProps) {
	const { items: programs } = useProgramsStore();
	const { items: groups } = useProgramGroupsStore();

	React.useEffect(() => {
		offlineDataAdapters.setProgramsLocal(programs);
	}, [programs]);

	React.useEffect(() => {
		offlineDataAdapters.setProgramGroupsLocal(groups);
	}, [groups]);

	return (
		<div className="space-y-6 pb-6">
			<ProgramsListInternal onOpenProgram={onOpenProgram} />
		</div>
	);
}

export function ProgramsListInternal({
	onOpenProgram,
}: {
	onOpenProgram: (programId: string) => void;
}) {
	const { items: programs } = useProgramsStore();
	const { items: groups } = useProgramGroupsStore();
	const sections = buildProgramSections(groups, programs);

	if (programs.length === 0 && groups.length === 0) return <ProgramEmptyState />;

	return (
		<div className="space-y-6">
			{sections.map((section) => (
				<ProgramGroupSection
					key={section.id}
					sectionId={section.id}
					name={section.name}
					programs={section.programs}
					onOpenProgram={onOpenProgram}
				/>
			))}
		</div>
	);
}
