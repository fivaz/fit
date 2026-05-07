import { revalidatePath } from "next/cache";

import { BodyMetricsUI, getEmptyBodyMetrics, latestBodyMetric } from "@/lib/body-metrics/type";
import { ROUTES } from "@/lib/consts";
import { prisma } from "@/lib/prisma";

import "server-only";

export async function getBodyMetrics(userId: string): Promise<BodyMetricsUI> {
	const metrics = await prisma.bodyMetric.findFirst({
		where: { userId },
		orderBy: { date: "desc" },
		...latestBodyMetric,
	});

	return metrics ?? getEmptyBodyMetrics();
}

export async function saveBodyMetrics(metrics: BodyMetricsUI, userId: string) {
	const today = new Date();
	today.setUTCHours(0, 0, 0, 0);

	await prisma.bodyMetric.upsert({
		where: {
			userId_date: {
				userId,
				date: today,
			},
		},
		update: {
			weight: metrics.weight,
			bodyFat: metrics.bodyFat,
			muscleMass: metrics.muscleMass,
			visceralFat: metrics.visceralFat,
		},
		create: {
			userId,
			date: today,
			weight: metrics.weight,
			bodyFat: metrics.bodyFat,
			muscleMass: metrics.muscleMass,
			visceralFat: metrics.visceralFat,
		},
	});

	revalidatePath(ROUTES.SETTINGS);
}
