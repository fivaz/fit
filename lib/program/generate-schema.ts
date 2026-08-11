import * as z from "zod";

import { MuscleGroup, type MuscleGroupType } from "@/lib/muscle/type";

const muscleGroupValues = Object.values(MuscleGroup) as [MuscleGroupType, ...MuscleGroupType[]];

export const generateProgramRequestSchema = z.object({
	description: z.string().trim().min(10).max(2000),
});

export const generatedProgramSchema = z.object({
	name: z.string().min(2).max(80),
	muscles: z.array(z.enum(muscleGroupValues)).min(1),
	exerciseIds: z
		.array(z.string().min(1))
		.min(3)
		.max(20)
		.describe(
			"Ordered exercise IDs from the catalog only; honor any requested count and keep the same length across all programs in a split",
		),
});

export const generatedProgramsSchema = z.object({
	groupName: z
		.string()
		.min(2)
		.max(80)
		.nullable()
		.describe(
			"Name for the program group when returning multiple programs; use null for a single program",
		),
	programs: z.array(generatedProgramSchema).min(1).max(7),
});

export type GeneratedProgram = z.infer<typeof generatedProgramSchema>;
export type GeneratedPrograms = z.infer<typeof generatedProgramsSchema>;

export type SanitizedProgram = {
	name: string;
	muscles: GeneratedProgram["muscles"];
	exerciseIds: string[];
};

export type SanitizedGenerationResult = {
	groupName: string | null;
	programs: SanitizedProgram[];
};

export const MIN_EXERCISES_PER_PROGRAM = 3;
export const DEFAULT_GROUP_NAME = "AI Generated Split";

export function sanitizeGeneratedPrograms(
	raw: GeneratedPrograms,
	catalogIdSet: Set<string>,
): SanitizedGenerationResult {
	const programs = raw.programs.map((program) => {
		const seen = new Set<string>();
		const exerciseIds = program.exerciseIds.filter((id) => {
			if (!catalogIdSet.has(id) || seen.has(id)) return false;
			seen.add(id);
			return true;
		});

		return {
			name: program.name,
			muscles: program.muscles,
			exerciseIds,
		};
	});

	const groupName = programs.length > 1 ? raw.groupName?.trim() || DEFAULT_GROUP_NAME : null;

	return { groupName, programs };
}

export function hasInvalidPrograms(programs: SanitizedProgram[]): boolean {
	return programs.some((program) => program.exerciseIds.length < MIN_EXERCISES_PER_PROGRAM);
}
