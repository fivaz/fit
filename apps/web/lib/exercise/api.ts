import { PAGE_SIZE } from "@/lib/consts";
import { ExerciseUI } from "@/lib/exercise/type";
import { MuscleGroupType } from "@/lib/muscle/type";
import { offlineDataAdapters } from "@/lib/offline/data-adapters";

export function getExercises({
	page = 1,
	pageSize = PAGE_SIZE,
}: {
	page?: number;
	pageSize?: number;
} = {}) {
	return offlineDataAdapters.getExercisesSearch({
		page,
		pageSize,
	});
}

export function getExercisesSearch({
	search,
	muscles,
	page = 1,
	pageSize = PAGE_SIZE,
}: {
	search?: string;
	muscles?: MuscleGroupType[];
	page: number;
	pageSize?: number;
}) {
	return offlineDataAdapters.getExercisesSearch({
		search,
		muscles,
		page,
		pageSize,
	});
}

export function saveExercise(exercise: ExerciseUI) {
	return offlineDataAdapters.saveExercise(exercise);
}

export function deleteExercise(id: string) {
	return offlineDataAdapters.deleteExercise(id);
}

export function reorderProgramExercises(programId: string, exerciseIds: string[]) {
	return offlineDataAdapters.reorderProgramExercises(programId, exerciseIds);
}
