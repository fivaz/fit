import { Prisma } from "@/generated/prisma/client";

export const latestBodyMetric = {
	select: {
		id: true,
		weight: true,
		bodyFat: true,
		muscleMass: true,
		visceralFat: true,
	},
} satisfies Prisma.BodyMetricDefaultArgs;
