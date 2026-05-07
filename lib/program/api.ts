import { apiFetch } from "@/lib/api-client";
import { ProgramUI } from "@/lib/program/type";

export function getPrograms() {
	return apiFetch<ProgramUI[]>("/api/programs");
}

export function saveProgram(program: ProgramUI) {
	return apiFetch<void>("/api/programs", {
		method: "POST",
		body: program,
	});
}

export function reorderPrograms(sortedIds: string[]) {
	return apiFetch<void>("/api/programs/reorder", {
		method: "PATCH",
		body: { sortedIds },
	});
}

export function deleteProgram(id: string) {
	return apiFetch<void>(`/api/programs/${id}`, {
		method: "DELETE",
	});
}

export function updateProgramExercises(exerciseIds: string[], programId: string) {
	return apiFetch<void>(`/api/programs/${programId}/exercises`, {
		method: "PUT",
		body: { exerciseIds },
	});
}
