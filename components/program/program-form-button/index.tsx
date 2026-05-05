"use client";

import * as React from "react";
import { useState } from "react";

import { PlusIcon } from "lucide-react";

import { ProgramForm } from "@/components/program/program-form-button/program-form";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { buildEmptyProgram, ProgramUI } from "@/lib/program/type";

type ProgramFormButtonProps = React.ComponentProps<typeof Button> & {
	program?: ProgramUI;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
};

export function ProgramFormButton({
	children,
	program = buildEmptyProgram(),
	open: externalOpen,
	onOpenChange: setExternalOpen,
	...props
}: ProgramFormButtonProps) {
	// Internal state management if external state isn't provided
	const [internalOpen, setInternalOpen] = useState(false);

	// Determine which state to use
	const isControlled = externalOpen !== undefined;
	const open = isControlled ? externalOpen : internalOpen;
	const onOpenChange = isControlled ? setExternalOpen : setInternalOpen;
	const isEditProgram = Boolean(program.id);
	const ariaLabel = props["aria-label"] ?? (isEditProgram ? "Edit program" : "Create program");

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			{/* Omit Trigger if controlled externally */}
			{!isControlled && (
				<DrawerTrigger asChild>
					<Button aria-label={ariaLabel} {...props}>
						{children || <PlusIcon className="size-5" />}
					</Button>
				</DrawerTrigger>
			)}

			<DrawerContent className="max-h-[90vh]">
				<div className="mx-auto w-full max-w-md overflow-y-auto pb-6">
					<DrawerHeader>
						<DrawerTitle>{isEditProgram ? "Edit Program" : "Create Program"}</DrawerTitle>
						{!isEditProgram && (
							<DrawerDescription>
								Name your program and select target muscle groups.
							</DrawerDescription>
						)}
					</DrawerHeader>

					<ProgramForm program={program} onClose={() => onOpenChange?.(false)} />
				</div>
			</DrawerContent>
		</Drawer>
	);
}
