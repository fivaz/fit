import { NextRequest, NextResponse } from "next/server";

import { requireApiUserId, routeErrorResponse } from "@/lib/api/server";
import { deleteProgramGroup } from "@/lib/program-group/service";

type RouteContext = {
	params: Promise<{ id: string }>;
};

export async function DELETE(_request: NextRequest, context: RouteContext) {
	try {
		const userId = await requireApiUserId();
		const { id } = await context.params;

		await deleteProgramGroup(id, userId);

		return new NextResponse(null, { status: 204 });
	} catch (error) {
		return routeErrorResponse(error, "DELETE /api/program-groups/[id]");
	}
}
