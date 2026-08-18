import { type FormEvent, useState } from "react";

import { toast } from "sonner";
import * as z from "zod";

import { SelectMuscles } from "@/components/select-muscles";
import { SelectProgramGroup } from "@/components/select-program-group";
import { Button } from "@/components/ui/button";
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProgramMutations } from "@/hooks/program/store";
import { saveProgram } from "@/lib/program/api";
import { formToProgram, ProgramUI } from "@/lib/program/type";

const formSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	muscles: z.array(z.string()).min(1, "Select at least one muscle group"),
});

type ProgramFormManualProps = {
	program: ProgramUI;
	onClose: () => void;
};

export function ProgramFormManual({ program, onClose }: ProgramFormManualProps) {
	const { addItem, updateItem } = useProgramMutations();
	const [errors, setErrors] = useState<{ name?: string; muscles?: string }>({});
	const isEdit = !!program.id;

	const validateFields = (data: ProgramUI) => {
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

		const programData = formToProgram(formData);

		if (!validateFields(programData)) return;

		const newProgram: ProgramUI = { ...programData, id: programData.id || crypto.randomUUID() };

		onClose();

		if (isEdit) {
			void updateItem(newProgram, {
				persist: () => saveProgram(newProgram),
				onSuccess: () => toast.success("Program updated successfully."),
				onError: () => toast.error("Failed to update program. Reverting."),
			});
		} else {
			void addItem(newProgram, {
				persist: () => saveProgram(newProgram),
				onSuccess: () => toast.success("Program created successfully."),
				onError: () => toast.error("Failed to create program. Reverting."),
			});
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6 px-4">
			{isEdit && <input type="hidden" name="id" value={program.id} />}
			<div className="grid gap-2">
				<Label htmlFor="name">Program Name</Label>
				<Input
					id="name"
					name="name"
					defaultValue={program.name}
					placeholder="e.g. Strength Training"
					className={errors.name ? "border-destructive" : ""}
				/>
				{errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
			</div>

			<div>
				<SelectMuscles defaultValue={program.muscles} />
				{errors.muscles && <p className="text-destructive text-sm">{errors.muscles}</p>}
			</div>

			<SelectProgramGroup defaultValue={program.groupId} />

			<DrawerFooter className="px-0">
				<Button type="submit" className="w-full">
					{isEdit ? "Save Changes" : "Create Program"}
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
