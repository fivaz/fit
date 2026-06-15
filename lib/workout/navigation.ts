type WorkoutSearchParams = Pick<URLSearchParams, "get">;

const WORKOUTS_PATH = "/workouts";

export function readWorkoutSelectedId(
	pathname: string,
	searchParams?: WorkoutSearchParams,
): string | null {
	const detailPrefix = `${WORKOUTS_PATH}/`;
	if (pathname.startsWith(detailPrefix)) {
		const [encodedWorkoutId] = pathname.slice(detailPrefix.length).split("/");
		if (!encodedWorkoutId) return null;
		return decodeURIComponent(encodedWorkoutId).trim() || null;
	}

	return searchParams?.get("id")?.trim() || null;
}

export function workoutDetailUrl(workoutId: string): string {
	return `${WORKOUTS_PATH}/${encodeURIComponent(workoutId)}`;
}

/** Cross-route links (e.g. progress → workout). Uses query params so static/Capacitor builds stay on `/workouts`. */
export function workoutDetailHref(workoutId: string): string {
	const params = new URLSearchParams({ id: workoutId });
	return `${WORKOUTS_PATH}?${params.toString()}`;
}

export function isWorkoutViewRoute(pathname: string): boolean {
	return pathname === WORKOUTS_PATH || pathname.startsWith(`${WORKOUTS_PATH}/`);
}
