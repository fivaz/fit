"use client";

import { useEffect, useMemo, useState } from "react";

import { getProgressStats } from "@/lib/progress/api";
import { emptyProgressStats, ProgressStatsUI } from "@/lib/progress/type";

type StatsFetchState = {
	rangeKey: string;
	stats: ProgressStatsUI;
	settled: boolean;
};

const initialFetchState: StatsFetchState = {
	rangeKey: "",
	stats: emptyProgressStats,
	settled: false,
};

export function useProgressStats(weekStart: Date, weekEnd: Date) {
	const rangeKey = useMemo(
		() => `${weekStart.toISOString()}_${weekEnd.toISOString()}`,
		[weekStart, weekEnd],
	);

	// Same rangeKey-derived loading pattern as use-progress-logs — avoids setState in effect.
	const [fetchState, setFetchState] = useState<StatsFetchState>(initialFetchState);

	useEffect(() => {
		let cancelled = false;

		void getProgressStats(weekStart, weekEnd)
			.then((loadedStats) => {
				if (!cancelled) {
					setFetchState({ rangeKey, stats: loadedStats, settled: true });
				}
			})
			.catch(() => {
				if (!cancelled) {
					setFetchState({ rangeKey, stats: emptyProgressStats, settled: true });
				}
			});

		return () => {
			cancelled = true;
		};
	}, [weekStart, weekEnd, rangeKey]);

	const isLoading = !fetchState.settled || fetchState.rangeKey !== rangeKey;
	const stats = fetchState.rangeKey === rangeKey ? fetchState.stats : emptyProgressStats;

	return { stats, isLoading };
}
