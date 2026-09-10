"use client";

import { useEffect, useMemo, useState } from "react";

import { getHomeRecentWorkouts } from "@/lib/progress/api";
import { HomeRecentWorkoutUI } from "@/lib/progress/type";

const DEFAULT_LIMIT = 5;

type FetchState = {
	limitKey: string;
	workouts: HomeRecentWorkoutUI[];
	settled: boolean;
};

const initialFetchState: FetchState = {
	limitKey: "",
	workouts: [],
	settled: false,
};

export function useHomeRecentWorkouts(limit: number = DEFAULT_LIMIT) {
	const limitKey = useMemo(() => String(limit), [limit]);

	const [fetchState, setFetchState] = useState<FetchState>(initialFetchState);

	useEffect(() => {
		let cancelled = false;

		void getHomeRecentWorkouts(limit)
			.then((workouts) => {
				if (!cancelled) {
					setFetchState({ limitKey, workouts, settled: true });
				}
			})
			.catch(() => {
				if (!cancelled) {
					setFetchState({ limitKey, workouts: [], settled: true });
				}
			});

		return () => {
			cancelled = true;
		};
	}, [limit, limitKey]);

	const isLoading = !fetchState.settled || fetchState.limitKey !== limitKey;
	const workouts = fetchState.limitKey === limitKey ? fetchState.workouts : [];

	return { workouts, isLoading };
}
