import { NextRequest, NextResponse } from "next/server";

import { readJson, requireApiUserId, routeErrorResponse } from "@/lib/api/server";
import { getProgramGroups, saveProgramGroup } from "@/lib/program-group/service";
import { ProgramGroupUI } from "@/lib/program-group/type";

export async function GET() {
	try {
		const userId = await requireApiUserId();
		const groups = await getProgramGroups(userId);

		return NextResponse.json(groups);
	} catch (error) {
		return routeErrorResponse(error, "GET /api/program-groups");
	}
}

export async function POST(request: NextRequest) {
	try {
		const userId = await requireApiUserId();
		const group = await readJson<ProgramGroupUI>(request);

		await saveProgramGroup(group, userId);

		return new NextResponse(null, { status: 204 });
	} catch (error) {
		return routeErrorResponse(error, "POST /api/program-groups");
	}
}
