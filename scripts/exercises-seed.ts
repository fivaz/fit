import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

import { MuscleGroup } from "@/lib/muscle/type";
import { prisma } from "@/lib/prisma";

import "dotenv/config";

const exerciseSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	bodyPart: z.string().optional().nullable(),
	equipment: z.string().optional().nullable(),
	target: z.string().optional().nullable(),
	secondaryMuscles: z.array(z.string()).optional(),
	instructions: z.array(z.string()).optional(),
	description: z.string().optional().nullable(),
	difficulty: z.string().optional().nullable(),
	category: z.string().optional().nullable(),
	// Updated to use the MuscleGroup enum
	muscles: z.array(z.enum(MuscleGroup)),
	imageUrl: z.string().optional().nullable(),
});

type ExerciseInput = z.infer<typeof exerciseSchema>;

/**
 * 1. Fetch JSON data from CDN
 */
async function fetchExercises(): Promise<unknown> {
	const seedUrl = process.env.EXERCISE_SEED_URL!;

	console.log(`🌐 Fetching exercises from: ${seedUrl}...`);
	const response = await fetch(seedUrl);

	if (!response.ok) {
		throw new Error(`Failed to fetch: ${response.statusText}`);
	}

	const data = await response.json();
	console.log("📥 Data downloaded successfully.");
	return data;
}

/**
 * 1. Read JSON data from local seed.json
 */
async function readExercises(): Promise<unknown> {
	try {
		// FIX: Get the directory path safely
		const currentFilePath = fileURLToPath(import.meta.url);
		const currentDir = dirname(currentFilePath);
		const filePath = join(currentDir, "seed.json");

		console.log(`📂 Reading exercises from local file: ${filePath}...`);

		const fileContent = await readFile(filePath, "utf-8");
		const data = JSON.parse(fileContent);

		console.log("📥 Local data loaded successfully.");
		return data;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		throw new Error(`Failed to read seed.json: ${message}`);
	}
}

/**
 * 2. Validate data against Zod Schema
 */
function validateExercises(data: unknown): ExerciseInput[] {
	console.log("🔍 Validating data structure...");
	const parsed = z.array(exerciseSchema).safeParse(data);

	if (!parsed.success) {
		console.error("❌ Validation failed:");
		console.error(JSON.stringify(z.formatError(parsed.error), null, 2));
		process.exit(1);
	}

	console.log("✅ Validation passed.");
	return parsed.data;
}

/**
 * 3. Bulk Insert into Database
 */
async function bulkInsert(exercises: ExerciseInput[]) {
	console.log(`🚀 Starting database seed for ${exercises.length} exercises...`);

	const result = await prisma.exercise.createMany({
		data: exercises,
		skipDuplicates: true,
	});

	console.log(`✨ Successfully seeded ${result.count} new exercises!`);
}

/**
 * Main Orchestrator
 */
async function seedDatabase() {
	try {
		const rawData = await fetchExercises();
		const validatedData = validateExercises(rawData);
		await bulkInsert(validatedData);

		console.log("\n🏁 Mission accomplished! Database is up to date.");
	} catch (error) {
		console.error("\n💥 Critical error during seeding:");
		console.error(error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

void seedDatabase();
