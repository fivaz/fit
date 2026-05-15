"use client";
import React, { useEffect, useMemo, useState } from "react";

import { eachDayOfInterval, endOfWeek, format, isSameDay, startOfWeek, subDays } from "date-fns";
import { motion } from "framer-motion";
import {
	ChevronLeft,
	ChevronRight,
	Clock,
	Dumbbell,
	Flame,
	Loader2,
	Plus,
	Timer,
	Weight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getProgressStats } from "@/lib/progress/api";
import { formatRestDuration } from "@/lib/progress/calculate-stats";
import { emptyProgressStats, ProgressStatsUI } from "@/lib/progress/type";

export default function Progress() {
	const [showLogModal, setShowLogModal] = useState(false);
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [weekOffset, setWeekOffset] = useState(0);
	const [stats, setStats] = useState<ProgressStatsUI>(emptyProgressStats);
	const [statsLoading, setStatsLoading] = useState(true);

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
				if (!cancelled) setStatsLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, []);

	// Form state
	const [formData, setFormData] = useState({
		program_id: "",
		duration_minutes: 30,
		exercises_completed: 0,
		calories_burned: 0,
		notes: "",
	});

	// Week navigation
	const currentWeekStart = useMemo(() => {
		const today = new Date();
		const start = startOfWeek(today, { weekStartsOn: 1 });
		return subDays(start, weekOffset * 7);
	}, [weekOffset]);

	const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
	const weekDays = eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd });

	// ─────────────────────────────────────────────
	// Dummy data — DESIGN ONLY
	// ─────────────────────────────────────────────

	const programs = [
		{ id: "p1", name: "Push Day" },
		{ id: "p2", name: "Pull Day" },
		{ id: "p3", name: "Leg Day" },
	];

	const logsLoading = false;

	const logs = [
		{
			id: "l1",
			date: new Date(),
			program_id: "p1",
			duration_minutes: 45,
			exercises_completed: 6,
			calories_burned: 420,
			notes: "Felt strong today 💪",
		},
		{
			id: "l2",
			date: subDays(new Date(), 2),
			program_id: "p2",
			duration_minutes: 35,
			exercises_completed: 5,
			calories_burned: 310,
			notes: "",
		},
	];

	// Fake “has workout” helper
	function hasWorkout(day: Date) {
		return logs.some((log) => isSameDay(log.date, day));
	}

	// Selected day logs
	function getLogsForDay(day: Date) {
		return logs.filter((log) => isSameDay(log.date, day));
	}

	const selectedDateLogs = getLogsForDay(selectedDate);

	return (
		<>
			{/* Header */}
			<div className="pb-6">
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Progress</h1>
						<p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
							Last 7 days · track your fitness journey
						</p>
					</div>
					<Button
						onClick={() => setShowLogModal(true)}
						size="icon"
						className="h-11 w-11 rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600"
					>
						<Plus className="h-5 w-5" />
					</Button>
				</div>

				{/* Last 7 days stats */}
				<div className="mb-6 grid grid-cols-2 gap-3">
					{statsLoading ? (
						<div className="col-span-2 flex justify-center py-8">
							<Loader2 className="h-6 w-6 animate-spin text-orange-500" />
						</div>
					) : (
						<>
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-4 text-white"
							>
								<Dumbbell className="mb-2 h-6 w-6 opacity-80" />
								<p className="text-3xl font-bold">{stats.workoutCount}</p>
								<p className="text-sm text-white/70">Workouts</p>
							</motion.div>
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.05 }}
								className="rounded-2xl bg-white p-4 dark:bg-gray-800"
							>
								<Clock className="mb-2 h-6 w-6 text-blue-500" />
								<p className="text-3xl font-bold text-gray-900 dark:text-white">
									{stats.avgWorkoutMinutes}
								</p>
								<p className="text-sm text-gray-500 dark:text-gray-400">Avg min</p>
							</motion.div>
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.1 }}
								className="rounded-2xl bg-white p-4 dark:bg-gray-800"
							>
								<Weight className="mb-2 h-6 w-6 text-red-500" />
								<p className="text-3xl font-bold text-gray-900 dark:text-white">
									{stats.avgWorkoutVolume.toLocaleString()}
								</p>
								<p className="text-sm text-gray-500 dark:text-gray-400">Avg volume</p>
							</motion.div>
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.15 }}
								className="rounded-2xl bg-white p-4 dark:bg-gray-800"
							>
								<Timer className="mb-2 h-6 w-6 text-green-500" />
								<p className="text-3xl font-bold text-gray-900 dark:text-white">
									{formatRestDuration(stats.avgRestSeconds)}
								</p>
								<p className="text-sm text-gray-500 dark:text-gray-400">Avg rest</p>
							</motion.div>
						</>
					)}
				</div>

				{/* Week Navigation */}
				<div className="mb-4 flex items-center justify-between">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setWeekOffset((prev) => prev + 1)}
						className="rounded-xl"
					>
						<ChevronLeft className="h-5 w-5" />
					</Button>
					<p className="text-sm font-medium text-gray-700 dark:text-gray-300">
						{format(currentWeekStart, "MMM d")} - {format(currentWeekEnd, "MMM d, yyyy")}
					</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setWeekOffset((prev) => Math.max(0, prev - 1))}
						disabled={weekOffset === 0}
						className="rounded-xl"
					>
						<ChevronRight className="h-5 w-5" />
					</Button>
				</div>

				{/* Week Days */}
				<div className="flex gap-2">
					{weekDays.map((day) => {
						const isSelected = isSameDay(day, selectedDate);
						const isToday = isSameDay(day, new Date());
						const hasLog = hasWorkout(day);

						return (
							<button
								key={day.toISOString()}
								onClick={() => setSelectedDate(day)}
								className={`flex flex-1 flex-col items-center rounded-xl py-3 transition-all ${
									isSelected
										? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
										: "bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300"
								}`}
							>
								<span className="text-xs opacity-70">{format(day, "EEE")}</span>
								<span className="mt-0.5 text-lg font-semibold">{format(day, "d")}</span>
								{hasLog && !isSelected && (
									<div className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500" />
								)}
								{isToday && !isSelected && (
									<div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
								)}
							</button>
						);
					})}
				</div>
			</div>

			{/* Selected Day Logs */}
			<div>
				<h3 className="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
					{format(selectedDate, "EEEE, MMMM d")}
				</h3>

				{logsLoading ? (
					<div className="flex justify-center py-8">
						<Loader2 className="h-6 w-6 animate-spin text-orange-500" />
					</div>
				) : selectedDateLogs.length === 0 ? (
					<div className="rounded-2xl bg-white py-8 text-center dark:bg-gray-800">
						<Dumbbell className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
						<p className="mb-4 text-gray-500 dark:text-gray-400">No workouts logged</p>
						<Button
							onClick={() => setShowLogModal(true)}
							className="bg-orange-500 text-white hover:bg-orange-600"
						>
							<Plus className="mr-2 h-4 w-4" />
							Log Workout
						</Button>
					</div>
				) : (
					<div className="space-y-3">
						{selectedDateLogs.map((log) => {
							const program = programs.find((p) => p.id === log.program_id);
							return (
								<motion.div
									key={log.id}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									className="rounded-2xl bg-white p-4 dark:bg-gray-800"
								>
									<div className="mb-3 flex items-start justify-between">
										<div>
											<h4 className="font-semibold text-gray-900 dark:text-white">
												{program?.name || "General Workout"}
											</h4>
											<p className="text-sm text-gray-500 dark:text-gray-400">
												{log.exercises_completed} exercises
											</p>
										</div>
									</div>
									<div className="flex gap-4">
										<div className="flex items-center gap-1.5">
											<Clock className="h-4 w-4 text-blue-500" />
											<span className="text-sm text-gray-600 dark:text-gray-300">
												{log.duration_minutes} min
											</span>
										</div>
										<div className="flex items-center gap-1.5">
											<Flame className="h-4 w-4 text-red-500" />
											<span className="text-sm text-gray-600 dark:text-gray-300">
												{log.calories_burned} cal
											</span>
										</div>
									</div>
									{log.notes && (
										<p className="mt-3 border-t border-gray-100 pt-3 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
											{log.notes}
										</p>
									)}
								</motion.div>
							);
						})}
					</div>
				)}
			</div>
		</>
	);
}
