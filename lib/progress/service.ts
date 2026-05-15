import { subDays } from "date-fns";

import { prisma } from "@/lib/prisma";
import { calculateProgressStats } from "@/lib/progress/calculate-stats";
import { ProgressStatsUI } from "@/lib/progress/type";

import "server-only";

const LOOKBACK_DAYS = 7;

export async function getProgressStats(userId: string): Promise<ProgressStatsUI> {
	const since = subDays(new Date(), LOOKBACK_DAYS);

	const workouts = await prisma.workout.findMany({
		where: {
			userId,
			endDate: { not: null, gte: since },
		},
		select: {
			startDate: true,
			endDate: true,
			exercises: {
				select: {
					sets: {
						select: {
							reps: true,
							weight: true,
							time: true,
						},
					},
				},
			},
		},
	});

	return calculateProgressStats(
		workouts.map((workout) => ({
			startDate: workout.startDate,
			endDate: workout.endDate,
			sets: workout.exercises.flatMap((exercise) => exercise.sets),
		})),
	);
}
