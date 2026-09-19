"use client";

import { format } from "date-fns";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { getTrend } from "@/lib/progress/trend";
import { ExerciseProgressSessionUI } from "@/lib/progress/type";

const TREND_ICONS = { up: TrendingUp, down: TrendingDown, equal: Minus } as const;
const TREND_WORDS = { up: "Increased", down: "Decreased", equal: "Unchanged" } as const;

export type ExerciseMetric = "weight" | "reps";

const METRICS = {
	weight: { label: "Weight", dataKey: "maxWeight", colorVar: "var(--chart-series-weight)" },
	reps: { label: "Reps", dataKey: "maxReps", colorVar: "var(--chart-series-reps)" },
} as const;

function formatDay(date: string) {
	return format(new Date(date), "MMM d");
}

type TooltipContentProps = {
	active?: boolean;
	payload?: ReadonlyArray<{ value?: number | string; payload?: ExerciseProgressSessionUI }>;
	label: string;
	metricLabel: string;
	colorVar: string;
};

function ChartTooltip({
	active,
	payload,
	metricLabel,
	colorVar,
}: Omit<TooltipContentProps, "label">) {
	const point = payload?.[0];
	if (!active || !point?.payload) return null;

	return (
		<div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-md dark:border-gray-700 dark:bg-gray-900">
			<p className="text-gray-500 dark:text-gray-400">
				{format(new Date(point.payload.date), "MMM d, yyyy")}
			</p>
			<p className="mt-1 flex items-center gap-2">
				<span
					aria-hidden
					className="inline-block h-0.5 w-3 rounded-full"
					style={{ backgroundColor: colorVar }}
				/>
				<span className="text-sm font-semibold text-gray-900 dark:text-white">{point.value}</span>
				<span className="text-gray-500 dark:text-gray-400">{metricLabel.toLowerCase()}</span>
			</p>
		</div>
	);
}

type ExerciseMetricChartProps = {
	exerciseName: string;
	metric: ExerciseMetric;
	sessions: ExerciseProgressSessionUI[];
};

export function ExerciseMetricChart({ exerciseName, metric, sessions }: ExerciseMetricChartProps) {
	const { label, dataKey, colorVar } = METRICS[metric];
	const latest = sessions.at(-1);
	const previous = sessions.at(-2);
	const latestValue = latest?.[dataKey];
	const trend = latest && previous ? getTrend(latest[dataKey], previous[dataKey]) : undefined;
	const TrendIcon = trend ? TREND_ICONS[trend] : null;

	return (
		<div className="chart-root">
			<div className="mb-1 flex items-baseline justify-between">
				<h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</h3>
				<p className="flex items-center gap-1.5 text-gray-900 dark:text-white">
					<span className="text-lg font-semibold">{latestValue}</span>
					{trend && TrendIcon && (
						<TrendIcon
							role="img"
							aria-label={`${TREND_WORDS[trend]} ${label.toLowerCase()} from previous session`}
							className="h-4 w-4 text-gray-500 dark:text-gray-400"
						/>
					)}
				</p>
			</div>
			<div
				role="img"
				aria-label={`${label} per workout for ${exerciseName}, latest ${latestValue}. Data table below.`}
				className="h-40 w-full"
			>
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={sessions} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
						<CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeWidth={1} />
						<XAxis
							dataKey="date"
							tickFormatter={formatDay}
							tickLine={false}
							axisLine={{ stroke: "var(--chart-grid)" }}
							tick={{ fill: "var(--chart-axis-text)", fontSize: 11 }}
							minTickGap={24}
							padding={{ left: 12, right: 12 }}
						/>
						<YAxis
							width={36}
							tickLine={false}
							axisLine={false}
							tick={{ fill: "var(--chart-axis-text)", fontSize: 11 }}
							domain={["auto", "auto"]}
							tickCount={4}
						/>
						<Tooltip
							cursor={{ stroke: "var(--chart-cursor)", strokeWidth: 1 }}
							content={(props) => (
								<ChartTooltip
									active={props.active}
									payload={props.payload as TooltipContentProps["payload"]}
									metricLabel={label}
									colorVar={colorVar}
								/>
							)}
						/>
						<Line
							type="linear"
							dataKey={dataKey}
							stroke={colorVar}
							strokeWidth={2}
							strokeLinecap="round"
							strokeLinejoin="round"
							dot={{ r: 4, fill: colorVar, stroke: "var(--chart-surface)", strokeWidth: 2 }}
							activeDot={{ r: 5, fill: colorVar, stroke: "var(--chart-surface)", strokeWidth: 2 }}
							isAnimationActive={false}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
