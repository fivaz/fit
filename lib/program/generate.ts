import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";

import { ExerciseCatalogItem } from "@/lib/exercise/catalog";
import { logError } from "@/lib/logger";
import { buildProgramGenerationSystemPrompt } from "@/lib/program/generate-prompt";
import {
	generatedProgramsSchema,
	hasInvalidPrograms,
	type SanitizedGenerationResult,
	sanitizeGeneratedPrograms,
} from "@/lib/program/generate-schema";

import "server-only";

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

async function callModel(description: string, catalog: ExerciseCatalogItem[]) {
	const system = buildProgramGenerationSystemPrompt(catalog);

	return generateObject({
		model: openai(getModelId()),
		schema: generatedProgramsSchema,
		schemaName: "WorkoutPrograms",
		schemaDescription: "One or more workout programs with exercise IDs from the catalog",
		system,
		prompt: description,
	});
}

export async function generateProgramsFromDescription(
	description: string,
	catalog: ExerciseCatalogItem[],
): Promise<SanitizedGenerationResult> {
	if (catalog.length === 0) {
		throw new ProgramGenerationError("Add exercises to your library first", 400);
	}

	assertOpenAiApiKeyConfigured();

	const catalogIdSet = new Set(catalog.map((exercise) => exercise.id));

	try {
		const { object } = await callModel(description, catalog);
		let sanitized = sanitizeGeneratedPrograms(object, catalogIdSet);

		if (hasInvalidPrograms(sanitized.programs)) {
			const { object: retryObject } = await callModel(
				`${description}\n\nSome exercise IDs were invalid. Use only exact "id" values from the catalog.`,
				catalog,
			);
			sanitized = sanitizeGeneratedPrograms(retryObject, catalogIdSet);
		}

		if (hasInvalidPrograms(sanitized.programs)) {
			throw new ProgramGenerationError(
				"Could not generate a valid program from your description. Try being more specific.",
				422,
			);
		}

		return sanitized;
	} catch (error) {
		if (error instanceof ProgramGenerationError) throw error;

		logError(error, "generateProgramsFromDescription");
		throw new ProgramGenerationError("Failed to generate program. Please try again.", 500);
	}
}
