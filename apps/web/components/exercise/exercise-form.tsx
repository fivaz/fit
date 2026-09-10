import { type FormEvent, useState } from "react";

import { toast } from "sonner";
import * as z from "zod";

import { SelectMuscles } from "@/components/select-muscles";
import { Button } from "@/components/ui/button";
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useExerciseMutations } from "@/hooks/exercise/store";
import { saveExercise } from "@/lib/exercise/api";
import { ExerciseUI, formToExercise } from "@/lib/exercise/type";

const formSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	muscles: z.array(z.string()).min(1, "Select at least one muscle group"),
});

type ExerciseFormProps = {
	exercise: ExerciseUI;
	onClose: () => void;
};

export function ExerciseForm({ exercise, onClose }: ExerciseFormProps) {
	const { addItem, updateItem } = useExerciseMutations();
	const [errors, setErrors] = useState<{ name?: string; muscles?: string }>({});
	const isEdit = !!exercise.id;

	const validateFields = (data: ExerciseUI) => {
		const result = formSchema.safeParse(data);
		if (!result.success) {
			const { fieldErrors } = z.flattenError(result.error);
			setErrors({ name: fieldErrors.name?.[0], muscles: fieldErrors.muscles?.[0] });
			return false;
		}
		setErrors({});
		return true;
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);

		const exerciseData = formToExercise(formData);

		if (!validateFields(exerciseData)) return;

		const optimisticExercise: ExerciseUI = {
			...exerciseData,
			id: exerciseData.id || crypto.randomUUID(),
		};

		onClose();

		if (isEdit) {
			updateItem(optimisticExercise, {
				persist: () => saveExercise(optimisticExercise),
				onSuccess: () => toast.success("Exercise updated successfully."),
				onError: () => toast.error("Failed to update exercise."),
			});
		} else {
			addItem(optimisticExercise, {
				persist: () => saveExercise(optimisticExercise),
				onSuccess: () => toast.success("Exercise created successfully."),
				onError: () => toast.error("Failed to create exercise."),
			});
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6 px-4">
			{isEdit && <input type="hidden" name="id" value={exercise.id} />}

			<div className="grid gap-2">
				<Label htmlFor="name">Exercise Name</Label>
				<Input
					id="name"
					name="name"
					defaultValue={exercise.name}
					placeholder="e.g. Strength Training"
					className={errors.name ? "border-destructive" : ""}
				/>
				{errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
			</div>

			<div>
				<SelectMuscles defaultValue={exercise.muscles} />
				{errors.muscles && <p className="text-destructive text-sm">{errors.muscles}</p>}
			</div>

			<DrawerFooter className="px-0">
				<Button type="submit" className="w-full">
					{isEdit ? "Save Changes" : "Create Exercise"}
				</Button>
				<DrawerClose asChild>
					<Button variant="outline" className="w-full">
						Cancel
					</Button>
				</DrawerClose>
			</DrawerFooter>
		</form>
	);
}
