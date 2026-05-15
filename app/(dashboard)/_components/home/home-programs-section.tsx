"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

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

export function HomeProgramsSection() {
	return (
		<div className="pb-8">
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
	);
}
