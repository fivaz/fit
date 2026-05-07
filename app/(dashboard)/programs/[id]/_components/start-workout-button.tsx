"use client";

import { FormEvent, useTransition } from "react";
import { useRouter } from "next/navigation";

import { LoaderCircleIcon, TimerIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useExerciseMutations, useExercisesStore } from "@/hooks/exercise/store";
import { ROUTES } from "@/lib/consts";
import { startWorkout } from "@/lib/workout/api";

type StartWorkoutButtonProps = {
	programId: string;
};

export function StartWorkoutButton({ programId }: StartWorkoutButtonProps) {
	const [isSubmitting, startTransition] = useTransition();
	const { isPending } = useExerciseMutations();
	const { items: exercises } = useExercisesStore();
	const router = useRouter();
	const isDisabled = exercises.length === 0;

	const handleStart = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		startTransition(async () => {
			const workout = await startWorkout(programId);
			router.push(`${ROUTES.WORKOUT}/${workout.id}`);
		});
	};

	return (
		<div className="fixed bottom-28 left-1/2 z-20 w-full max-w-md -translate-x-1/2 px-6">
			<form onSubmit={handleStart}>
				<Button
					size="lg"
					type="submit"
					disabled={isPending || isSubmitting || isDisabled}
					className="h-12 w-full rounded-2xl bg-linear-to-r from-orange-500 to-orange-600 text-lg font-semibold text-white shadow-xl shadow-orange-500/40 transition-transform hover:from-orange-600 hover:to-orange-700 active:scale-[0.98]"
				>
					{isSubmitting ? (
						<LoaderCircleIcon className="size-6 animate-spin" />
					) : (
						<TimerIcon className="size-6" />
					)}
					Start Workout
				</Button>
			</form>
		</div>
	);
}
