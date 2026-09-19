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
	startDate: string;
	endDate: string;
	programName: string;
	exerciseCount: number;
	durationMinutes: number;
	volume: number;
};

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

/** Best logged working set of one exercise in one finished workout. */
export type ExerciseProgressSessionUI = {
	workoutId: string;
	date: string;
	maxWeight: number;
	maxReps: number;
};

export type ProgramExerciseProgressUI = {
	exerciseId: string;
	name: string;
	/** Oldest first. */
	sessions: ExerciseProgressSessionUI[];
};

export type ProgramProgressUI = {
	programName: string;
	exercises: ProgramExerciseProgressUI[];
};
