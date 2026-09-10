"use client";

import { useEffect, useMemo, useState } from "react";

import { getProgressWorkoutLogs } from "@/lib/progress/api";
import { ProgressWorkoutLogUI } from "@/lib/progress/type";

type LogsFetchState = {
	rangeKey: string;
	logs: ProgressWorkoutLogUI[];
	settled: boolean;
};

const initialFetchState: LogsFetchState = {
	rangeKey: "",
	logs: [],
	settled: false,
};

export function useProgressLogs(weekStart: Date, weekEnd: Date) {
	const rangeKey = useMemo(
		() => `${weekStart.toISOString()}_${weekEnd.toISOString()}`,
		[weekStart, weekEnd],
	);

	// Track fetch results by week rangeKey and derive loading from it instead of calling
	// setIsLoading(true) at the start of the effect — react-hooks/set-state-in-effect
	// rejects synchronous setState in the effect body when the calendar week changes.
	const [fetchState, setFetchState] = useState<LogsFetchState>(initialFetchState);

	useEffect(() => {
		let cancelled = false;

		void getProgressWorkoutLogs(weekStart, weekEnd)
			.then((loadedLogs) => {
				if (!cancelled) {
					setFetchState({ rangeKey, logs: loadedLogs, settled: true });
				}
			})
			.catch(() => {
				if (!cancelled) {
					setFetchState({ rangeKey, logs: [], settled: true });
				}
			});

		return () => {
			cancelled = true;
		};
	}, [weekStart, weekEnd, rangeKey]);

	const isLoading = !fetchState.settled || fetchState.rangeKey !== rangeKey;
	const logs = fetchState.rangeKey === rangeKey ? fetchState.logs : [];

	return { logs, isLoading };
}
