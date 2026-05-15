"use client";

import { WorkoutDetail } from "@/components/workout/workout-detail";
import { useActiveWorkoutHome } from "@/hooks/workout/active-workout-home";

function HomePlaceholder() {
	return <Test />;

	return (
		<div className="relative flex w-full flex-col">
			<div className="flex items-start justify-between pb-4">
				<div>
					<h1 className="text-foreground text-2xl font-bold">Home</h1>
					<small className="mt-1 text-red-500">(not implemented yet)</small>
				</div>
			</div>
		</div>
	);
}

function Test() {
	const { activeWorkout } = useActiveWorkoutHome();

	if (activeWorkout === undefined) {
		return <div className="py-8 text-sm text-gray-500">Loading...</div>;
	}

	if (activeWorkout) {
		return <WorkoutDetail initialWorkout={activeWorkout} />;
	}

	return <HomePlaceholder />;
}

import React from "react";

import { motion } from "framer-motion";
import { ChevronRight, Dumbbell, Flame, Play, Target, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";

// Mock data for the visual template
const MOCK_USER = { full_name: "Alex Thompson" };
const MOCK_PROGRAMS = [
	{
		id: "1",
		name: "Full Body Ignite",
		muscle_groups: ["Chest", "Back", "Legs"],
		image_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop",
	},
	{
		id: "2",
		name: "Core Crusher",
		muscle_groups: ["Abs", "Obliques"],
		image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop",
	},
	{
		id: "3",
		name: "Push Day Pro",
		muscle_groups: ["Shoulders", "Triceps"],
		image_url: "https://images.unsplash.com/photo-1581009146145-b5ef03a7403f?w=200&h=200&fit=crop",
	},
];
const MOCK_STATS = [
	{ label: "Workouts", value: 5, icon: Dumbbell, color: "bg-orange-500" },
	{ label: "Minutes", value: 240, icon: Flame, color: "bg-red-500" },
	{ label: "Calories", value: 1850, icon: TrendingUp, color: "bg-green-500" },
	{ label: "Programs", value: 3, icon: Target, color: "bg-blue-500" },
];

export default function HomeTemplate() {
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			{/* Hero Section */}
			<div className="relative px-5 pt-12 pb-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="space-y-1"
				>
					<p className="text-gray-500 dark:text-gray-400">Welcome back,</p>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
						{MOCK_USER.full_name.split(" ")[0]}
					</h1>
				</motion.div>

				{/* Quick Start Card */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-xl shadow-orange-500/30"
				>
					<div className="relative z-10">
						<h2 className="mb-1 text-lg font-semibold">Ready to workout?</h2>
						<p className="mb-4 text-sm text-white/80">Start your training session now</p>
						<Button className="bg-white font-semibold text-orange-600 hover:bg-white/90">
							<Play className="mr-2 h-4 w-4" />
							Start Workout
						</Button>
					</div>
					<div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-white/10" />
					<div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10" />
				</motion.div>
			</div>

			{/* Stats Grid */}
			<div className="mb-8 px-5">
				<h3 className="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
					This Week
				</h3>
				<div className="grid grid-cols-2 gap-3">
					{MOCK_STATS.map((stat, index) => (
						<motion.div
							key={stat.label}
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.1 + index * 0.05 }}
							className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800"
						>
							<div
								className={`h-10 w-10 ${stat.color} mb-3 flex items-center justify-center rounded-xl`}
							>
								<stat.icon className="h-5 w-5 text-white" />
							</div>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
							<p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
						</motion.div>
					))}
				</div>
			</div>

			{/* Recent Programs */}
			<div className="px-5 pb-8">
				<div className="mb-3 flex items-center justify-between">
					<h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
						Your Programs
					</h3>
					<span className="flex cursor-pointer items-center text-sm font-medium text-orange-500">
						See all <ChevronRight className="h-4 w-4" />
					</span>
				</div>

				<div className="space-y-3">
					{MOCK_PROGRAMS.map((program, index) => (
						<motion.div
							key={program.id}
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.2 + index * 0.05 }}
							className="flex cursor-pointer items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800"
						>
							<div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl">
								<img
									src={program.image_url}
									alt={program.name}
									className="h-full w-full object-cover"
								/>
							</div>
							<div className="min-w-0 flex-1">
								<h4 className="truncate font-semibold text-gray-900 dark:text-white">
									{program.name}
								</h4>
								<p className="text-sm text-gray-500 dark:text-gray-400">
									{program.muscle_groups.join(", ")}
								</p>
							</div>
							<ChevronRight className="h-5 w-5 text-gray-400" />
						</motion.div>
					))}
				</div>
			</div>

			{/* Exercise Count Card */}
			<div className="px-5 pb-8">
				<div className="flex cursor-pointer items-center justify-between rounded-2xl bg-gradient-to-r from-gray-800 to-gray-900 p-5 dark:from-gray-700 dark:to-gray-800">
					<div>
						<p className="text-sm text-white/60">Exercise Library</p>
						<p className="text-2xl font-bold text-white">124 Exercises</p>
					</div>
					<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
						<Dumbbell className="h-6 w-6 text-white" />
					</div>
				</div>
			</div>
		</div>
	);
}
