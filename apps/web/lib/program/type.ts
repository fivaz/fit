import type { MuscleGroupType } from "@fit/shared";
import { buildEmptyProgram, type OrderedExercise, type ProgramUI, type ProgramWithExercises } from "@fit/shared";

export { buildEmptyProgram, type OrderedExercise, type ProgramUI, type ProgramWithExercises };

export function formToProgram(formData: FormData): ProgramUI {
	const groupId = (formData.get("groupId") as string) || null;

	return {
		id: (formData.get("id") as string) || "",
		name: (formData.get("name") as string) || "",
		muscles: formData.getAll("muscles") as MuscleGroupType[],
		order: 0,
		imageUrl: null,
		groupId: groupId || null,
	};
}
