"use client";

import { useMemo } from "react";

import { ProgressStatsGrid } from "@/app/(dashboard)/progress/_components/progress-stats-grid";
import { useProgressWeekRange } from "@/app/(dashboard)/progress/_hooks/use-progress-week-range";
import { formatProgressPeriodAriaLabel } from "@/lib/progress/utils";

export function HomeWeekStats() {
	const { weekStart, weekEnd } = useProgressWeekRange(0);
	const periodAriaLabel = useMemo(
		() => formatProgressPeriodAriaLabel(0, weekStart, weekEnd),
		[weekStart, weekEnd],
	);

	return (
		<div className="mb-8">
			<h3 className="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
				This Week
			</h3>
			<ProgressStatsGrid
				weekStart={weekStart}
				weekEnd={weekEnd}
				periodAriaLabel={periodAriaLabel}
			/>
		</div>
	);
}
