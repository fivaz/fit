import { revalidatePath } from "next/cache";

import { BodyMetricsUI, getEmptyBodyMetrics, latestBodyMetric } from "@/lib/body-metrics/type";
import { ROUTES } from "@/lib/consts";
import { prisma } from "@/lib/prisma";

import "server-only";

export interface BodyMetricsRepository {
	findLatest(userId: string): Promise<BodyMetricsUI | null>;
	upsertForDate(userId: string, date: Date, metrics: BodyMetricsUI): Promise<void>;
}

const prismaBodyMetricsRepository: BodyMetricsRepository = {
	async findLatest(userId) {
		return prisma.bodyMetric.findFirst({
			where: { userId },
			orderBy: { date: "desc" },
			...latestBodyMetric,
		});
	},

	async upsertForDate(userId, date, metrics) {
		await prisma.bodyMetric.upsert({
			where: { userId_date: { userId, date } },
			update: {
				weight: metrics.weight,
				bodyFat: metrics.bodyFat,
				muscleMass: metrics.muscleMass,
				visceralFat: metrics.visceralFat,
			},
			create: {
				userId,
				date,
				weight: metrics.weight,
				bodyFat: metrics.bodyFat,
				muscleMass: metrics.muscleMass,
				visceralFat: metrics.visceralFat,
			},
		});
	},
};

export function createBodyMetricsService(repository: BodyMetricsRepository) {
	return {
		async getBodyMetrics(userId: string): Promise<BodyMetricsUI> {
			const metrics = await repository.findLatest(userId);

			return metrics ?? getEmptyBodyMetrics();
		},

		async saveBodyMetrics(metrics: BodyMetricsUI, userId: string) {
			const today = new Date();
			today.setUTCHours(0, 0, 0, 0);

			await repository.upsertForDate(userId, today, metrics);
			revalidatePath(ROUTES.SETTINGS);
		},
	};
}

const bodyMetricsService = createBodyMetricsService(prismaBodyMetricsRepository);

export const getBodyMetrics = bodyMetricsService.getBodyMetrics;
export const saveBodyMetrics = bodyMetricsService.saveBodyMetrics;
