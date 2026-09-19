import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";

import type { ExerciseCatalogItem } from "@/exercise/catalog";
import { logError } from "@/logger";
import {
	buildExercisePickSystemPrompt,
	buildProgramPlanSystemPrompt,
} from "@/program/generate-prompt";
import {
	filterCatalogByMuscles,
	generatedPlanSchema,
	hasInvalidPrograms,
	MIN_EXERCISES_PER_PROGRAM,
	type PlannedProgram,
	programExercisesSchema,
	resolveGroupName,
	type SanitizedGenerationResult,
	type SanitizedProgram,
	sanitizeExerciseIds,
} from "@/program/generate-schema";

const DEFAULT_MODEL = "gpt-4o-mini";

export class ProgramGenerationError extends Error {
	constructor(
		message: string,
		public readonly status: number,
	) {
		super(message);
		this.name = "ProgramGenerationError";
	}
}

function assertOpenAiApiKeyConfigured(): void {
	if (!process.env.OPENAI_API_KEY) {
		throw new ProgramGenerationError("AI program generation is not configured", 503);
	}
}

function getModelId(): string {
	return process.env.AI_PROGRAM_MODEL ?? DEFAULT_MODEL;
}

async function planPrograms(description: string, catalog: ExerciseCatalogItem[]) {
	const availableMuscles = [...new Set(catalog.flatMap((exercise) => exercise.muscles))];

	const { object } = await generateObject({
		model: openai(getModelId()),
		schema: generatedPlanSchema,
		schemaName: "WorkoutProgramPlan",
		schemaDescription: "A plan of one or more workout programs, without exercises",
		system: buildProgramPlanSystemPrompt(availableMuscles),
		prompt: description,
	});

	return object;
}

async function pickExercises(
	description: string,
	program: PlannedProgram,
	catalog: ExerciseCatalogItem[],
	extraInstruction = "",
) {
	const count = Math.min(program.exerciseCount, catalog.length);

	const { object } = await generateObject({
		model: openai(getModelId()),
		schema: programExercisesSchema,
		schemaName: "ProgramExercises",
		schemaDescription: "Exercise IDs from the catalog for one workout program",
		system: buildExercisePickSystemPrompt(program, catalog, count),
		prompt: `${description}${extraInstruction}`,
	});

	return sanitizeExerciseIds(object.exerciseIds, new Set(catalog.map(({ id }) => id)), count);
}

async function buildProgram(
	description: string,
	program: PlannedProgram,
	fullCatalog: ExerciseCatalogItem[],
): Promise<SanitizedProgram> {
	// Only exercises matching the program's muscles are ever shown to the model.
	const catalog = filterCatalogByMuscles(fullCatalog, program.muscles);

	if (catalog.length < MIN_EXERCISES_PER_PROGRAM) {
		throw new ProgramGenerationError(
			`Not enough exercises for ${program.muscles.join(", ")} in your library. Add more exercises or adjust your description.`,
			422,
		);
	}

	let exerciseIds = await pickExercises(description, program, catalog);

	if (exerciseIds.length < MIN_EXERCISES_PER_PROGRAM) {
		exerciseIds = await pickExercises(
			description,
			program,
			catalog,
			`\n\nSome exercise IDs were invalid. Use only exact "id" values from the catalog.`,
		);
	}

	return { name: program.name, muscles: program.muscles, exerciseIds };
}

export async function generateProgramsFromDescription(
	description: string,
	catalog: ExerciseCatalogItem[],
): Promise<SanitizedGenerationResult> {
	if (catalog.length === 0) {
		throw new ProgramGenerationError("Add exercises to your library first", 400);
	}

	assertOpenAiApiKeyConfigured();

	try {
		const plan = await planPrograms(description, catalog);
		const programs = await Promise.all(
			plan.programs.map((program) => buildProgram(description, program, catalog)),
		);

		if (hasInvalidPrograms(programs)) {
			throw new ProgramGenerationError(
				"Could not generate a valid program from your description. Try being more specific.",
				422,
			);
		}

		return { groupName: resolveGroupName(plan), programs };
	} catch (error) {
		if (error instanceof ProgramGenerationError) throw error;

		logError(error, "generateProgramsFromDescription");
		throw new ProgramGenerationError("Failed to generate program. Please try again.", 500);
	}
}
