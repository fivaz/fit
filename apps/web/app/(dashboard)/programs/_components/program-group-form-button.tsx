"use client";

import * as React from "react";

import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProgramGroupMutations } from "@/hooks/program-group/store";
import { saveProgramGroup } from "@/lib/program-group/api";
import { buildEmptyProgramGroup } from "@/lib/program-group/type";

const formSchema = z.object({
	name: z.string().min(2, "Group name must be at least 2 characters"),
});

type ProgramGroupFormButtonProps = React.ComponentProps<typeof Button>;

export function ProgramGroupFormButton({ children, ...props }: ProgramGroupFormButtonProps) {
	const [open, setOpen] = React.useState(false);
	const [error, setError] = React.useState<string>();
	const { addItem } = useProgramGroupMutations();

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const name = String(formData.get("name") ?? "").trim();
		const result = formSchema.safeParse({ name });

		if (!result.success) {
			setError(result.error.flatten().fieldErrors.name?.[0]);
			return;
		}

		const group = { ...buildEmptyProgramGroup(), id: crypto.randomUUID(), name };
		setError(undefined);
		setOpen(false);

		void addItem(group, {
			persist: () => saveProgramGroup(group),
			onSuccess: () => toast.success("Group created successfully."),
			onError: () => toast.error("Failed to create group. Reverting."),
		});
	};

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>
				<Button aria-label="Create program group" variant="outline" {...props}>
					{children ?? "Add group"}
				</Button>
			</DrawerTrigger>

			<DrawerContent className="max-h-[90vh]">
				<div className="mx-auto w-full max-w-md overflow-y-auto pb-6">
					<DrawerHeader>
						<DrawerTitle>Create Group</DrawerTitle>
						<DrawerDescription>Organize your programs into named groups.</DrawerDescription>
					</DrawerHeader>

					<form onSubmit={handleSubmit} className="space-y-6 px-4">
						<div className="grid gap-2">
							<Label htmlFor="group-name">Group Name</Label>
							<Input
								id="group-name"
								name="name"
								placeholder="e.g. Strength Block"
								className={error ? "border-destructive" : ""}
							/>
							{error && <p className="text-destructive text-sm">{error}</p>}
						</div>

						<DrawerFooter className="px-0">
							<Button type="submit" className="w-full">
								Create Group
							</Button>
							<DrawerClose asChild>
								<Button variant="outline" className="w-full">
									Cancel
								</Button>
							</DrawerClose>
						</DrawerFooter>
					</form>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
