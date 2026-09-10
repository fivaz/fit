import { Body, Controller, Get, HttpCode, Put, UseGuards } from "@nestjs/common";
import type { BodyMetricsUI } from "@fit/shared";

import { AuthGuard } from "@/auth/auth.guard";
import { UserId } from "@/auth/user-id.decorator";
import { getBodyMetrics, saveBodyMetrics } from "@/body-metrics/body-metrics.service";

@Controller("body-metrics")
@UseGuards(AuthGuard)
export class BodyMetricsController {
	@Get()
	get(@UserId() userId: string) {
		return getBodyMetrics(userId);
	}

	@Put()
	@HttpCode(204)
	async save(@UserId() userId: string, @Body() metrics: BodyMetricsUI) {
		await saveBodyMetrics(metrics, userId);
	}
}
