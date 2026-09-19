"use client";

import { motion } from "framer-motion";
import { type LucideIcon, Minus, TrendingDown, TrendingUp } from "lucide-react";

import { type Trend } from "@/lib/progress/trend";
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
	/** Direction of change versus the previous period; omitted when there is nothing to compare. */
	trend?: Trend;
};

const TREND_ICONS = { up: TrendingUp, down: TrendingDown, equal: Minus } as const;
const TREND_LABELS = {
	up: "Increased from previous week",
	down: "Decreased from previous week",
	equal: "Unchanged from previous week",
} as const;

export function ProgressStatCard({
	regionLabel,
	valueLabel,
	value,
	caption,
	icon: Icon,
	iconClassName,
	variant = "default",
	animationDelay = 0,
	trend,
}: ProgressStatCardProps) {
	const isPrimary = variant === "primary";
	const TrendIcon = trend ? TREND_ICONS[trend] : null;

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
			<div className="flex items-center gap-2">
				<p
					aria-label={valueLabel}
					className={cn("text-3xl font-bold", !isPrimary && "text-gray-900 dark:text-white")}
				>
					{value}
				</p>
				{trend && TrendIcon && (
					<TrendIcon
						role="img"
						aria-label={TREND_LABELS[trend]}
						className={cn(
							"h-5 w-5",
							isPrimary ? "text-white/80" : "text-gray-500 dark:text-gray-400",
						)}
					/>
				)}
			</div>
			<p
				className={cn("text-sm", isPrimary ? "text-white/70" : "text-gray-500 dark:text-gray-400")}
			>
				{caption}
			</p>
		</motion.section>
	);
}
