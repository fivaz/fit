"use client";

import * as React from "react";
import { useState } from "react";

import { PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { ExerciseForm } from "@/components/exercise/exercise-form";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { useConfirm } from "@/hooks/confirm/use-confirm";
import { useExerciseMutations } from "@/hooks/exercise/store";
import { deleteExerciseAction } from "@/lib/exercise/actions";
import { buildEmptyExercise, ExerciseUI } from "@/lib/exercise/type";

type ExerciseFormButtonProps = React.ComponentProps<typeof Button> & {
	exercise?: ExerciseUI;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
};

export function ExerciseFormButton({
	children,
	exercise = buildEmptyExercise(),
	open: externalOpen,
	onOpenChange: setExternalOpen,
	...props
}: ExerciseFormButtonProps) {
	// Internal state management if external state isn't provided
	const [internalOpen, setInternalOpen] = useState(false);
	const { deleteItem } = useExerciseMutations();
	const confirm = useConfirm();
	// Determine which state to use
	const isControlled = externalOpen !== undefined;
	const open = isControlled ? externalOpen : internalOpen;
	const setOpen = isControlled ? setExternalOpen : setInternalOpen;

	const handleDelete = async () => {
		const confirmed = await confirm({
			title: "Delete Exercise",
			message: `Are you sure you want to delete "${exercise.name}"? This action cannot be undone`,
		});

		if (!confirmed) return;

		deleteItem(exercise.id, {
			persist: () => deleteExerciseAction(exercise.id),
			onSuccess: () => toast.success("Exercise deleted successfully."),
			onError: () => toast.error("Failed to delete exercise."),
		});
	};

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			{/* Omit Trigger if controlled externally */}
			{!isControlled && (
				<DrawerTrigger asChild>
					<Button aria-label="Create exercise" {...props}>
						{children || <PlusIcon className="size-5" />}
					</Button>
				</DrawerTrigger>
			)}

			<DrawerContent className="max-h-[90vh]">
				<div className="mx-auto w-full max-w-md overflow-y-auto pb-6">
					<DrawerHeader className="relative">
						<DrawerTitle>{exercise.id ? "Edit Exercise" : "Create Exercise"}</DrawerTitle>
						{exercise.id && exercise.isPrivate && (
							<Button
								aria-label="Delete exercise"
								variant="destructive"
								className="absolute top-0 right-0 mx-4 my-2"
								onClick={handleDelete}
							>
								<Trash2Icon />
							</Button>
						)}
					</DrawerHeader>

					<ExerciseForm exercise={exercise} onClose={() => setOpen?.(false)} />
				</div>
			</DrawerContent>
		</Drawer>
	);
}
