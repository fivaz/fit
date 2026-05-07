"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { DumbbellIcon, EditIcon, MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AddExerciseForm } from "@/app/(dashboard)/programs/[id]/_components/add-exercise-form";
import { ProgramExerciseList } from "@/app/(dashboard)/programs/[id]/_components/program-exercise-list";
import { StartWorkoutButton } from "@/app/(dashboard)/programs/[id]/_components/start-workout-button";
import { MuscleBadges } from "@/components/muscle-badges";
import { ProgramFormButton } from "@/components/program/program-form-button";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/hooks/confirm/use-confirm";
import { ExercisesProvider } from "@/hooks/exercise/store";
import { ProgramsProvider, useProgramMutations, useProgramsStore } from "@/hooks/program/store";
import { ROUTES } from "@/lib/consts";
import { deleteProgramAction } from "@/lib/program/actions";
import { ProgramWithExercises } from "@/lib/program/type";

type ProgramDetailProps = {
	program: ProgramWithExercises;
};

export function ProgramDetails({ program }: ProgramDetailProps) {
	return (
		<ProgramsProvider initialItems={[program]}>
			<ProgramDetailsInternal />
		</ProgramsProvider>
	);
}

export function ProgramDetailsInternal() {
	const { firstItem } = useProgramsStore();
	const { deleteItem } = useProgramMutations();
	const confirm = useConfirm();
	const [showProgramForm, setShowProgramForm] = useState(false);
	const [showAddExerciseForm, setShowAddExerciseForm] = useState(false);
	const router = useRouter();
	if (!firstItem) return null;
	const program = firstItem as ProgramWithExercises;

	const handleDelete = async () => {
		const confirmed = await confirm({
			title: "Delete Program",
			message: `Are you sure you want to delete "${program.name}"? This action cannot be undone`,
		});

		if (!confirmed) return;

		deleteItem(program.id, {
			persist: () => deleteProgramAction(program.id),
			onSuccess: () => {
				toast.success("Program deleted successfully.");
				router.push(ROUTES.PROGRAMS);
			},
			onError: () => toast.error("Failed to delete program."),
		});
	};

	return (
		<>
			<div className="relative flex w-full flex-col">
				{/* Header with back button */}
				<div className="flex items-start pb-4">
					<div className="flex flex-1 items-start gap-4">
						<div>
							<h1 className="text-foreground text-2xl font-bold">{program.name}</h1>
							<MuscleBadges muscles={program.muscles} />
						</div>
					</div>

					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<Button aria-label="Program actions" variant="outline" size="icon">
								<MoreVertical className="size-5" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => setShowAddExerciseForm(true)}>
								<DumbbellIcon className="size-4" />
								<span>Add Exercises</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setShowProgramForm(true)}>
								<EditIcon className="size-4" />
								<span>Edit Program</span>
							</DropdownMenuItem>
							<DropdownMenuItem variant="destructive" onClick={handleDelete}>
								<Trash2 className="size-4" />
								<span>Delete Program</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<ExercisesProvider initialItems={program.exercises}>
					<ProgramExerciseList programId={program.id} />
					<StartWorkoutButton programId={program.id} isDisabled={program.exercises.length === 0} />
					<AddExerciseForm
						program={program}
						open={showAddExerciseForm}
						onOpenChange={setShowAddExerciseForm}
					/>
				</ExercisesProvider>
			</div>

			<ProgramFormButton
				program={program}
				open={showProgramForm}
				onOpenChange={setShowProgramForm}
			/>
		</>
	);
}
