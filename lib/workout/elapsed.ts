function padTwo(value: number): string {
	return String(value).padStart(2, "0");
}

/** Formats workout duration as mm:ss, or h:mm:ss when longer than an hour. */
export function formatWorkoutElapsed(startDate: Date | string, endDate: Date = new Date()): string {
	const totalSeconds = Math.max(
		0,
		Math.floor((endDate.getTime() - new Date(startDate).getTime()) / 1000),
	);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	if (hours > 0) {
		return `${hours}:${padTwo(minutes)}:${padTwo(seconds)}`;
	}

	return `${padTwo(minutes)}:${padTwo(seconds)}`;
}
