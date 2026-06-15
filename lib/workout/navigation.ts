const WORKOUTS_PATH = "/workouts";

export function workoutDetailHref(workoutId: string): string {
	return `${WORKOUTS_PATH}/${encodeURIComponent(workoutId)}`;
}

export function isWorkoutViewRoute(pathname: string): boolean {
	return pathname === WORKOUTS_PATH || pathname.startsWith(`${WORKOUTS_PATH}/`);
}
