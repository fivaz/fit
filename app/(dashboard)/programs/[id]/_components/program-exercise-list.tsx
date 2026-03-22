import * as React from "react";

import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { toast } from "sonner";

import { ProgramExerciseRow } from "@/app/(dashboard)/programs/[id]/_components/program–exercise-row";
import { ExerciseEmptyState } from "@/components/exercise/exercise-empty-state";
import { useExerciseMutations, useExercisesStore } from "@/hooks/exercise/store";
import { reorderProgramExercisesAction } from "@/lib/exercise/actions";
import { OrderedExercise } from "@/lib/program/type";
import { sameOrder } from "@/lib/utils";

type ProgramExerciseListProps = {
	programId: string;
};

export function ProgramExerciseList({ programId }: ProgramExerciseListProps) {
	const { items } = useExercisesStore();
	const { setItems } = useExerciseMutations();

	const exercises = (items as OrderedExercise[]).toSorted((a, b) => a.order - b.order);

	if (exercises.length === 0) return <ExerciseEmptyState />;

	return (
		<DragDropProvider
			onDragEnd={(event) => {
				const nextItems = move(exercises, event);

				if (sameOrder(exercises, nextItems)) return;

				setItems(nextItems, {
					persist: () =>
						reorderProgramExercisesAction(
							programId,
							nextItems.map((e) => e.id),
						),
					onError: () => toast.error("Failed to reorder program's exercises."),
				});
			}}
		>
			<div className="flex flex-col gap-4 pb-28">
				{exercises.map((exercise, index) => (
					<ProgramExerciseRow key={exercise.id} exercise={exercise} index={index} />
				))}
			</div>
		</DragDropProvider>
	);
}
