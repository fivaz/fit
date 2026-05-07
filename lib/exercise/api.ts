import { apiFetch } from "@/lib/api-client";
import { PAGE_SIZE } from "@/lib/consts";
import { ExerciseUI } from "@/lib/exercise/type";
import { MuscleGroup } from "@/lib/generated/prisma/client";

export function getExercises({
	page = 1,
	pageSize = PAGE_SIZE,
}: {
	page?: number;
	pageSize?: number;
} = {}) {
	const params = new URLSearchParams({
		page: String(page),
		pageSize: String(pageSize),
	});

	return apiFetch<ExerciseUI[]>(`/api/exercises?${params.toString()}`);
}

export function getExercisesSearch({
	search,
	muscles,
	page = 1,
	pageSize = PAGE_SIZE,
}: {
	search?: string;
	muscles?: MuscleGroup[];
	page: number;
	pageSize?: number;
}) {
	const params = new URLSearchParams({
		page: String(page),
		pageSize: String(pageSize),
	});

	if (search) {
		params.set("search", search);
	}

	muscles?.forEach((muscle) => params.append("muscles", muscle));

	return apiFetch<ExerciseUI[]>(`/api/exercises?${params.toString()}`);
}

export function saveExercise(exercise: ExerciseUI) {
	return apiFetch<void>("/api/exercises", {
		method: "POST",
		body: exercise,
	});
}

export function deleteExercise(id: string) {
	return apiFetch<void>(`/api/exercises/${id}`, {
		method: "DELETE",
	});
}

export function reorderProgramExercises(programId: string, exerciseIds: string[]) {
	return apiFetch<void>(`/api/programs/${programId}/exercises/reorder`, {
		method: "PATCH",
		body: { exerciseIds },
	});
}
