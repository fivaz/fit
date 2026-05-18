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

export type ProgressWorkoutLogUI = {
	id: string;
	endDate: string;
	programName: string;
	exerciseCount: number;
	durationMinutes: number;
	volume: number;
};

/** Finished workout row for home (program snapshot + completion time). */
export type HomeRecentWorkoutUI = {
	id: string;
	programId: string | null;
	endDate: string;
	programName: string;
	exerciseCount: number;
	durationMinutes: number;
	volume: number;
	programMuscles: string[];
	programImageUrl: string | null;
};
