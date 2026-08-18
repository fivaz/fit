import { ProgramUI } from "@/lib/program/type";
import { ProgramGroupUI } from "@/lib/program-group/type";
import { UNGROUPED_GROUP_ID } from "@/lib/programs/ui-preferences";

export type ProgramSection = {
	id: string;
	name: string;
	programs: ProgramUI[];
};

export function buildProgramSections(
	groups: ProgramGroupUI[],
	programs: ProgramUI[],
): ProgramSection[] {
	const sortedGroups = groups.toSorted((a, b) => a.order - b.order);

	const sections: ProgramSection[] = sortedGroups.map((group) => ({
		id: group.id,
		name: group.name,
		programs: programs
			.filter((program) => program.groupId === group.id)
			.toSorted((a, b) => a.order - b.order),
	}));

	const ungroupedPrograms = programs
		.filter((program) => !program.groupId)
		.toSorted((a, b) => a.order - b.order);

	if (ungroupedPrograms.length > 0) {
		sections.push({
			id: UNGROUPED_GROUP_ID,
			name: "Ungrouped",
			programs: ungroupedPrograms,
		});
	}

	return sections;
}

export function sectionGroupId(sectionId: string): string | null {
	return sectionId === UNGROUPED_GROUP_ID ? null : sectionId;
}
