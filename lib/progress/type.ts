export type ProgressStatsUI = {
	workoutCount: number;
	avgWorkoutMinutes: number;
	avgWorkoutVolume: number;
	avgRestSeconds: number;
};

export const emptyProgressStats: ProgressStatsUI = {
	workoutCount: 0,
	avgWorkoutMinutes: 0,
	avgWorkoutVolume: 0,
	avgRestSeconds: 0,
};
