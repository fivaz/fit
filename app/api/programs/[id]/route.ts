import { NextRequest, NextResponse } from "next/server";

import { requireApiUserId, routeErrorResponse } from "@/lib/api/server";
import { deleteProgram, getProgramById } from "@/lib/program/service";

type ProgramRouteParams = {
	params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, { params }: ProgramRouteParams) {
	try {
		const userId = await requireApiUserId();
		const { id } = await params;
		const program = await getProgramById(id, userId);

		if (!program) {
			return NextResponse.json({ error: "Program not found" }, { status: 404 });
		}

		return NextResponse.json(program);
	} catch (error) {
		return routeErrorResponse(error, "GET /api/programs/[id]");
	}
}

export async function DELETE(_request: NextRequest, { params }: ProgramRouteParams) {
	try {
		const userId = await requireApiUserId();
		const { id } = await params;

		await deleteProgram(id, userId);

		return new NextResponse(null, { status: 204 });
	} catch (error) {
		return routeErrorResponse(error, "DELETE /api/programs/[id]");
	}
}
