import { isSameDay, subDays } from "date-fns";

export type ProgressWorkoutLog = {
	id: string;
	date: Date;
	programId: string;
	durationMinutes: number;
	exercisesCompleted: number;
	caloriesBurned: number;
	notes: string;
};

export type ProgressProgram = {
	id: string;
	name: string;
};

/** Placeholder data until day logs are backed by the API. */
export const MOCK_PROGRESS_PROGRAMS: ProgressProgram[] = [
	{ id: "p1", name: "Push Day" },
	{ id: "p2", name: "Pull Day" },
	{ id: "p3", name: "Leg Day" },
];

export const MOCK_PROGRESS_LOGS: ProgressWorkoutLog[] = [
	{
		id: "l1",
		date: new Date(),
		programId: "p1",
		durationMinutes: 45,
		exercisesCompleted: 6,
		caloriesBurned: 420,
		notes: "Felt strong today 💪",
	},
	{
		id: "l2",
		date: subDays(new Date(), 2),
		programId: "p2",
		durationMinutes: 35,
		exercisesCompleted: 5,
		caloriesBurned: 310,
		notes: "",
	},
];

export function getLogsForDay(logs: ProgressWorkoutLog[], day: Date) {
	return logs.filter((log) => isSameDay(log.date, day));
}

export function hasWorkoutOnDay(logs: ProgressWorkoutLog[], day: Date) {
	return logs.some((log) => isSameDay(log.date, day));
}
