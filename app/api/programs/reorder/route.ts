import { NextRequest, NextResponse } from "next/server";

import { readJson, requireApiUserId, routeErrorResponse } from "@/lib/api/server";
import { reorderPrograms } from "@/lib/program/service";

type ReorderProgramsBody = {
	sortedIds?: string[];
};

export async function PATCH(request: NextRequest) {
	try {
		const userId = await requireApiUserId();
		const { sortedIds } = await readJson<ReorderProgramsBody>(request);

		if (!sortedIds) {
			return NextResponse.json({ error: "sortedIds is required" }, { status: 400 });
		}

		await reorderPrograms(sortedIds, userId);

		return new NextResponse(null, { status: 204 });
	} catch (error) {
		return routeErrorResponse(error, "PATCH /api/programs/reorder");
	}
}
