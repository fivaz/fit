import { useMemo } from "react";

import { Dumbbell } from "lucide-react";

import { WorkoutViewSetRow } from "@/components/workout/workout-view-set-row";
import { getCompletedSetsInOrder } from "@/lib/workout/completed-sets-order";
import { WorkoutWithMappedSets } from "@/lib/workout/type";

type WorkoutViewSetListProps = {
	workout: WorkoutWithMappedSets;
};

export function WorkoutViewSetList({ workout }: WorkoutViewSetListProps) {
	const completedSets = useMemo(() => getCompletedSetsInOrder(workout), [workout]);

	if (completedSets.length === 0) {
		return (
			<div className="rounded-2xl bg-white py-10 text-center shadow-sm dark:bg-gray-800">
				<Dumbbell className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" aria-hidden />
				<p className="text-gray-500 dark:text-gray-400">No completed sets logged</p>
			</div>
		);
	}

	return (
		<ul className="space-y-3" aria-label="Sets in completion order">
			{completedSets.map((entry, index) => (
				<WorkoutViewSetRow key={entry.set.id} entry={entry} index={index} />
			))}
		</ul>
	);
}
