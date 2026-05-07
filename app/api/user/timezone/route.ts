import { NextRequest, NextResponse } from "next/server";

import { readJson, requireApiUserId, routeErrorResponse } from "@/lib/api/server";
import { updateTimezone } from "@/lib/user/service";

type UpdateTimezoneBody = {
	timezone?: string;
};

export async function PATCH(request: NextRequest) {
	try {
		const userId = await requireApiUserId();
		const { timezone } = await readJson<UpdateTimezoneBody>(request);

		if (!timezone) {
			return NextResponse.json({ error: "Timezone is required" }, { status: 400 });
		}

		const result = await updateTimezone(timezone, userId);

		return NextResponse.json(result);
	} catch (error) {
		return routeErrorResponse(error, "PATCH /api/user/timezone");
	}
}
