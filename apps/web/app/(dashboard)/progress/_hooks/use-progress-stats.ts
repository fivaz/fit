"use client";

import { useEffect, useMemo, useState } from "react";

import { subWeeks } from "date-fns";

import { getProgressStats } from "@/lib/progress/api";
import { emptyProgressStats, ProgressStatsUI } from "@/lib/progress/type";

type StatsFetchState = {
	rangeKey: string;
	stats: ProgressStatsUI;
	/** Stats for the week before the requested range; null when they could not be loaded. */
	previousStats: ProgressStatsUI | null;
	settled: boolean;
};

const initialFetchState: StatsFetchState = {
	rangeKey: "",
	stats: emptyProgressStats,
	previousStats: null,
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

		// A failed previous-week fetch only hides the trend arrows; it must not fail the cards.
		const loadPreviousStats = getProgressStats(subWeeks(weekStart, 1), subWeeks(weekEnd, 1)).catch(
			() => null,
		);

		void Promise.all([getProgressStats(weekStart, weekEnd), loadPreviousStats])
			.then(([loadedStats, previousStats]) => {
				if (!cancelled) {
					setFetchState({ rangeKey, stats: loadedStats, previousStats, settled: true });
				}
			})
			.catch(() => {
				if (!cancelled) {
					setFetchState({
						rangeKey,
						stats: emptyProgressStats,
						previousStats: null,
						settled: true,
					});
				}
			});

		return () => {
			cancelled = true;
		};
	}, [weekStart, weekEnd, rangeKey]);

	const isLoading = !fetchState.settled || fetchState.rangeKey !== rangeKey;
	const stats = fetchState.rangeKey === rangeKey ? fetchState.stats : emptyProgressStats;

	const previousStats = fetchState.rangeKey === rangeKey ? fetchState.previousStats : null;

	return { stats, previousStats, isLoading };
}
