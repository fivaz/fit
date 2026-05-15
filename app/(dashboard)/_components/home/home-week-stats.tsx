"use client";

import { motion } from "framer-motion";
import { Dumbbell, Flame, Target, TrendingUp } from "lucide-react";

const MOCK_STATS = [
	{ label: "Workouts", value: 5, icon: Dumbbell, color: "bg-orange-500" },
	{ label: "Minutes", value: 240, icon: Flame, color: "bg-red-500" },
	{ label: "Calories", value: 1850, icon: TrendingUp, color: "bg-green-500" },
	{ label: "Programs", value: 3, icon: Target, color: "bg-blue-500" },
];

export function HomeWeekStats() {
	return (
		<div className="mb-8">
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
	);
}
