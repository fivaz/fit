import { NextRequest, NextResponse } from "next/server";

import { readJson, requireApiUserId, routeErrorResponse } from "@/lib/api/server";
import { getExerciseCatalogForUser } from "@/lib/exercise/catalog";
import { generateProgramsFromDescription, ProgramGenerationError } from "@/lib/program/generate";
import { generateProgramRequestSchema } from "@/lib/program/generate-schema";
import { createGeneratedPrograms } from "@/lib/program/service";

export async function POST(request: NextRequest) {
	try {
		const userId = await requireApiUserId();
		const body = await readJson(request);
		const parsed = generateProgramRequestSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: parsed.error.flatten().fieldErrors.description?.[0] ?? "Invalid request" },
				{ status: 400 },
			);
		}

		const catalog = await getExerciseCatalogForUser(userId);
		const generated = await generateProgramsFromDescription(parsed.data.description, catalog);
		const { programs, group } = await createGeneratedPrograms(generated, userId);

		return NextResponse.json({ programs, group });
	} catch (error) {
		if (error instanceof ProgramGenerationError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}
		return routeErrorResponse(error, "POST /api/programs/generate");
	}
}
