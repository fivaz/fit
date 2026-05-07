import { NextRequest, NextResponse } from "next/server";

import { readJson, requireApiUserId, routeErrorResponse } from "@/lib/api/server";
import { getBodyMetrics, saveBodyMetrics } from "@/lib/body-metrics/service";
import { BodyMetricsUI } from "@/lib/body-metrics/type";

export async function GET() {
	try {
		const userId = await requireApiUserId();
		const metrics = await getBodyMetrics(userId);

		return NextResponse.json(metrics);
	} catch (error) {
		return routeErrorResponse(error, "GET /api/body-metrics");
	}
}

export async function PUT(request: NextRequest) {
	try {
		const userId = await requireApiUserId();
		const metrics = await readJson<BodyMetricsUI>(request);

		await saveBodyMetrics(metrics, userId);

		return new NextResponse(null, { status: 204 });
	} catch (error) {
		return routeErrorResponse(error, "PUT /api/body-metrics");
	}
}
