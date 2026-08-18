"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type ProgressStatCardProps = {
	regionLabel: string;
	valueLabel: string;
	value: string | number;
	caption: string;
	icon: LucideIcon;
	iconClassName?: string;
	variant?: "primary" | "default";
	animationDelay?: number;
};

export function ProgressStatCard({
	regionLabel,
	valueLabel,
	value,
	caption,
	icon: Icon,
	iconClassName,
	variant = "default",
	animationDelay = 0,
}: ProgressStatCardProps) {
	const isPrimary = variant === "primary";

	return (
		<motion.section
			aria-label={regionLabel}
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: animationDelay }}
			className={cn(
				"rounded-2xl p-4",
				isPrimary
					? "bg-gradient-to-br from-orange-500 to-orange-600 text-white"
					: "bg-white dark:bg-gray-800",
			)}
		>
			<Icon className={cn("mb-2 h-6 w-6", isPrimary ? "opacity-80" : iconClassName)} aria-hidden />
			<p
				aria-label={valueLabel}
				className={cn("text-3xl font-bold", !isPrimary && "text-gray-900 dark:text-white")}
			>
				{value}
			</p>
			<p
				className={cn("text-sm", isPrimary ? "text-white/70" : "text-gray-500 dark:text-gray-400")}
			>
				{caption}
			</p>
		</motion.section>
	);
}
