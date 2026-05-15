"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";

const MOCK_USER = { full_name: "Alex Thompson" };

export function HomeWelcomeHero() {
	return (
		<div className="relative pb-8">
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
	);
}
