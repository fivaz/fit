import { offlineDataAdapters } from "@/lib/offline/data-adapters";
import { ProgramUI, ProgramWithExercises } from "@/lib/program/type";
import { ProgramGroupUI } from "@/lib/program-group/type";

export type GenerateProgramsResult = {
	programs: ProgramWithExercises[];
	group: ProgramGroupUI | null;
};

export function getPrograms() {
	return offlineDataAdapters.getPrograms();
}

export function getProgramById(programId: string): Promise<ProgramWithExercises | null> {
	return offlineDataAdapters.getProgramById(programId);
}

export function saveProgram(program: ProgramUI) {
	return offlineDataAdapters.saveProgram(program);
}

export function generatePrograms(description: string) {
	return offlineDataAdapters.generatePrograms(description);
}

export function reorderPrograms(groupId: string | null, sortedIds: string[]) {
	return offlineDataAdapters.reorderPrograms(groupId, sortedIds);
}

export function deleteProgram(id: string) {
	return offlineDataAdapters.deleteProgram(id);
}

export function updateProgramExercises(exerciseIds: string[], programId: string) {
	return offlineDataAdapters.updateProgramExercises(exerciseIds, programId);
}
