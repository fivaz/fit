"use client";

import { useEffect, useState } from "react";

import { getProgressStats } from "@/lib/progress/api";
import { emptyProgressStats, ProgressStatsUI } from "@/lib/progress/type";

export function useProgressStats() {
	const [stats, setStats] = useState<ProgressStatsUI>(emptyProgressStats);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		void getProgressStats()
			.then((loadedStats) => {
				if (!cancelled) setStats(loadedStats);
			})
			.catch(() => {
				if (!cancelled) setStats(emptyProgressStats);
			})
			.finally(() => {
				if (!cancelled) setIsLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, []);

	return { stats, isLoading };
}
