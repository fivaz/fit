"use client";

import { useEffect, useState } from "react";

import { getHomeExerciseLibraryCount } from "@/lib/home/api";

type FetchState = {
	count: number | null;
	settled: boolean;
};

const initialFetchState: FetchState = {
	count: null,
	settled: false,
};

export function useHomeExerciseCount() {
	const [fetchState, setFetchState] = useState<FetchState>(initialFetchState);

	useEffect(() => {
		let cancelled = false;

		void getHomeExerciseLibraryCount()
			.then(({ count }) => {
				if (!cancelled) {
					setFetchState({ count, settled: true });
				}
			})
			.catch(() => {
				if (!cancelled) {
					setFetchState({ count: null, settled: true });
				}
			});

		return () => {
			cancelled = true;
		};
	}, []);

	const isLoading = !fetchState.settled;

	return { count: fetchState.count, isLoading };
}
