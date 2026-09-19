"use client";

import { format } from "date-fns";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import { getTrend, type Trend } from "@/lib/progress/trend";
import { ProgramExerciseProgressUI } from "@/lib/progress/type";

const TREND_ICONS = { up: TrendingUp, down: TrendingDown, equal: Minus } as const;
const TREND_WORDS = { up: "Increased", down: "Decreased", equal: "Unchanged" } as const;

const MAX_HISTORY_ROWS = 6;

type MetricTrendProps = {
	metric: "weight" | "reps";
	trend: Trend | undefined;
};

function MetricTrend({ metric, trend }: MetricTrendProps) {
	if (!trend) return <span className="h-4 w-4" aria-hidden />;

	const Icon = TREND_ICONS[trend];
	return (
		<Icon
			role="img"
			aria-label={`${TREND_WORDS[trend]} ${metric} from previous session`}
			className="h-4 w-4 text-gray-500 dark:text-gray-400"
		/>
	);
}

type ExerciseProgressCardProps = {
	exercise: ProgramExerciseProgressUI;
};

export function ExerciseProgressCard({ exercise }: ExerciseProgressCardProps) {
	const { name, sessions } = exercise;
	const latest = sessions.at(-1);

	// Newest first, each row compared with the session that came before it.
	const history = sessions
		.map((session, index) => {
			const previous = sessions[index - 1];
			return {
				session,
				weightTrend: previous ? getTrend(session.maxWeight, previous.maxWeight) : undefined,
				repsTrend: previous ? getTrend(session.maxReps, previous.maxReps) : undefined,
			};
		})
		.reverse()
		.slice(0, MAX_HISTORY_ROWS);

	return (
		<article
			aria-label={`Progress for ${name}`}
			className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800"
		>
			<h2 className="font-semibold text-gray-900 dark:text-white">{name}</h2>

			{latest ? (
				<>
					<p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
						{sessions.length} {sessions.length === 1 ? "session" : "sessions"} logged
					</p>
					<table className="w-full text-sm">
						<thead>
							<tr className="text-left text-xs text-gray-500 dark:text-gray-400">
								<th scope="col" className="pb-1 font-medium">
									Date
								</th>
								<th scope="col" className="pb-1 font-medium">
									Weight
								</th>
								<th scope="col" className="pb-1 font-medium">
									Reps
								</th>
							</tr>
						</thead>
						<tbody className="text-gray-900 dark:text-white">
							{history.map(({ session, weightTrend, repsTrend }) => (
								<tr
									key={session.workoutId}
									className="border-t border-gray-100 dark:border-gray-700"
								>
									<td className="py-2 text-gray-600 dark:text-gray-300">
										{format(new Date(session.date), "MMM d, yyyy")}
									</td>
									<td className="py-2">
										<span className="flex items-center gap-1.5">
											{session.maxWeight}
											<MetricTrend metric="weight" trend={weightTrend} />
										</span>
									</td>
									<td className="py-2">
										<span className="flex items-center gap-1.5">
											{session.maxReps}
											<MetricTrend metric="reps" trend={repsTrend} />
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</>
			) : (
				<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
					No finished workouts with this exercise yet.
				</p>
			)}
		</article>
	);
}
