"use client";

import * as React from "react";
import { useState } from "react";

import { PenLineIcon, PlusIcon, SparklesIcon } from "lucide-react";

import { ProgramFormManual } from "@/components/program/program-form-button/program-form";
import { ProgramFormAutomatic } from "@/components/program/program-form-button/program-form-automatic";
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

type CreationMode = "automatic" | "manual";

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
	const [internalOpen, setInternalOpen] = useState(false);
	const [creationMode, setCreationMode] = useState<CreationMode>("automatic");

	const isControlled = externalOpen !== undefined;
	const open = isControlled ? externalOpen : internalOpen;
	const onOpenChange = isControlled ? setExternalOpen : setInternalOpen;
	const isEditProgram = Boolean(program.id);
	const ariaLabel = props["aria-label"] ?? (isEditProgram ? "Edit program" : "Create program");

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			setCreationMode("automatic");
		}
		onOpenChange?.(nextOpen);
	};

	return (
		<Drawer open={open} onOpenChange={handleOpenChange}>
			{!isControlled && (
				<DrawerTrigger asChild>
					<Button aria-label={ariaLabel} {...props}>
						{children || <PlusIcon className="size-5" />}
					</Button>
				</DrawerTrigger>
			)}

			<DrawerContent className="max-h-[90vh]">
				<div className="mx-auto w-full max-w-md overflow-y-auto pb-6">
					<DrawerHeader className="relative">
						<DrawerTitle>{isEditProgram ? "Edit Program" : "Create Program"}</DrawerTitle>
						{isEditProgram ? null : creationMode === "automatic" ? (
							<>
								<DrawerDescription>
									Tell our AI coach what you want and we&apos;ll build your program.
								</DrawerDescription>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="absolute top-0 right-0 mx-4 my-2"
									aria-label="Switch to manual program creation"
									onClick={() => setCreationMode("manual")}
								>
									<PenLineIcon className="size-4" />
									Manual
								</Button>
							</>
						) : (
							<>
								<DrawerDescription>
									Name your program and select target muscle groups.
								</DrawerDescription>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="absolute top-0 right-0 mx-4 my-2"
									aria-label="Switch to automatic program creation"
									onClick={() => setCreationMode("automatic")}
								>
									<SparklesIcon className="size-4" />
									AI coach
								</Button>
							</>
						)}
					</DrawerHeader>

					{isEditProgram || creationMode === "manual" ? (
						<ProgramFormManual program={program} onClose={() => handleOpenChange(false)} />
					) : (
						<ProgramFormAutomatic onClose={() => handleOpenChange(false)} />
					)}
				</div>
			</DrawerContent>
		</Drawer>
	);
}
