import { ProgramUI } from "@/lib/program/type";
import { ProgramSection, sectionGroupId } from "@/lib/programs/grouping";

export type ProgramDragState = Record<string, string[]>;

export function sectionsToDragState(sections: ProgramSection[]): ProgramDragState {
	return Object.fromEntries(
		sections.map((section) => [section.id, section.programs.map((program) => program.id)]),
	);
}

export function dragStateToSections(
	dragState: ProgramDragState,
	sections: ProgramSection[],
): ProgramSection[] {
	const programById = new Map(
		sections.flatMap((section) => section.programs.map((program) => [program.id, program])),
	);

	return sections.map((section) => ({
		...section,
		programs: (dragState[section.id] ?? [])
			.map((id) => programById.get(id))
			.filter((program): program is ProgramUI => program != null),
	}));
}

export function dragStateToPrograms(
	dragState: ProgramDragState,
	programs: ProgramUI[],
): ProgramUI[] {
	const programById = new Map(programs.map((program) => [program.id, program]));
	const assignedIds = new Set<string>();

	const updatedPrograms = Object.entries(dragState).flatMap(([sectionId, ids]) => {
		const groupId = sectionGroupId(sectionId);

		return ids.flatMap((id, order) => {
			const program = programById.get(id);
			if (!program) return [];

			assignedIds.add(id);
			return [{ ...program, groupId, order }];
		});
	});

	const untouchedPrograms = programs.filter((program) => !assignedIds.has(program.id));

	return [...updatedPrograms, ...untouchedPrograms];
}

export function getChangedSections(before: ProgramDragState, after: ProgramDragState): string[] {
	const sectionIds = new Set([...Object.keys(before), ...Object.keys(after)]);

	return [...sectionIds].filter((sectionId) => {
		const beforeIds = before[sectionId] ?? [];
		const afterIds = after[sectionId] ?? [];

		return (
			beforeIds.length !== afterIds.length || beforeIds.some((id, index) => id !== afterIds[index])
		);
	});
}
