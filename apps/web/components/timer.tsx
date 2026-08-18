"use client";

import React, { useEffect, useState } from "react";

import { intervalToDuration } from "date-fns";
import { Clock } from "lucide-react";

interface WorkoutTimerProps {
	startDate: Date | string;
}

export function WorkoutTimer({ startDate }: WorkoutTimerProps) {
	// Convert string to Date once
	const start = new Date(startDate);
	const [now, setNow] = useState(new Date());

	useEffect(() => {
		// Update every minute (60000ms)
		const timer = setInterval(() => {
			setNow(new Date());
		}, 60000);

		// Refresh if user returns to the tab after a long time
		const handleFocus = () => setNow(new Date());
		window.addEventListener("focus", handleFocus);

		return () => {
			clearInterval(timer);
			window.removeEventListener("focus", handleFocus);
		};
	}, []);

	const duration = intervalToDuration({
		start,
		end: now,
	});

	// Formatting: 1h 05m or just 5m
	const hours = duration.hours ? `${duration.hours}h ` : "";
	const minutes = `${duration.minutes || 0}m`;

	return (
		<div className="flex items-center gap-1.5 text-gray-500 tabular-nums dark:text-gray-400">
			<Clock className="h-3.5 w-3.5" />
			<span>
				{hours}
				{minutes}
			</span>
		</div>
	);
}
