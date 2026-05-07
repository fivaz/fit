import { NextRequest, NextResponse } from "next/server";

import { readJson, requireApiUserId, routeErrorResponse } from "@/lib/api/server";
import { getPrograms, saveProgram } from "@/lib/program/service";
import { ProgramUI } from "@/lib/program/type";

export async function GET() {
	try {
		const userId = await requireApiUserId();
		const programs = await getPrograms(userId);

		return NextResponse.json(programs);
	} catch (error) {
		return routeErrorResponse(error, "GET /api/programs");
	}
}

export async function POST(request: NextRequest) {
	try {
		const userId = await requireApiUserId();
		const program = await readJson<ProgramUI>(request);

		await saveProgram(program, userId);

		return new NextResponse(null, { status: 204 });
	} catch (error) {
		return routeErrorResponse(error, "POST /api/programs");
	}
}
