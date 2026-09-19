import { MuscleGroup, type MuscleGroupType } from "@fit/shared";
import * as z from "zod";

const muscleGroupValues = Object.values(MuscleGroup) as [MuscleGroupType, ...MuscleGroupType[]];

export const generateProgramRequestSchema = z.object({
	description: z.string().trim().min(10).max(2000),
});

export const plannedProgramSchema = z.object({
	name: z.string().min(2).max(80),
	muscles: z.array(z.enum(muscleGroupValues)).min(1),
	exerciseCount: z
		.number()
		.int()
		.min(3)
		.max(20)
		.describe(
			"How many exercises this program gets; honor any requested count and keep it the same across all programs in a split",
		),
});

export const generatedPlanSchema = z.object({
	groupName: z
		.string()
		.min(2)
		.max(80)
		.nullable()
		.describe(
			"Name for the program group when returning multiple programs; use null for a single program",
		),
	programs: z.array(plannedProgramSchema).min(1).max(7),
});

export const programExercisesSchema = z.object({
	exerciseIds: z
		.array(z.string().min(1))
		.min(3)
		.max(20)
		.describe("Ordered exercise IDs from the provided catalog only"),
});

export type PlannedProgram = z.infer<typeof plannedProgramSchema>;
export type GeneratedPlan = z.infer<typeof generatedPlanSchema>;

export type SanitizedProgram = {
	name: string;
	muscles: PlannedProgram["muscles"];
	exerciseIds: string[];
};

export type SanitizedGenerationResult = {
	groupName: string | null;
	programs: SanitizedProgram[];
};

export const MIN_EXERCISES_PER_PROGRAM = 3;
export const DEFAULT_GROUP_NAME = "AI Generated Split";

/** Catalog entries that target at least one of the given muscles. */
export function filterCatalogByMuscles<T extends { muscles: MuscleGroupType[] }>(
	catalog: T[],
	muscles: MuscleGroupType[],
): T[] {
	return catalog.filter((exercise) => exercise.muscles.some((muscle) => muscles.includes(muscle)));
}

/** Keeps only allowed IDs, dedupes, and caps the list at `limit`, preserving order. */
export function sanitizeExerciseIds(
	ids: string[],
	allowedIdSet: Set<string>,
	limit: number,
): string[] {
	const seen = new Set<string>();
	const valid = ids.filter((id) => {
		if (!allowedIdSet.has(id) || seen.has(id)) return false;
		seen.add(id);
		return true;
	});
	return valid.slice(0, limit);
}

export function resolveGroupName(plan: GeneratedPlan): string | null {
	return plan.programs.length > 1 ? plan.groupName?.trim() || DEFAULT_GROUP_NAME : null;
}

export function hasInvalidPrograms(programs: SanitizedProgram[]): boolean {
	return programs.some((program) => program.exerciseIds.length < MIN_EXERCISES_PER_PROGRAM);
}
