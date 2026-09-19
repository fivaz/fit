"use client";

import * as React from "react";

import { useDroppable } from "@dnd-kit/react";
import { ChevronDown, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { ProgramRow } from "@/app/(dashboard)/programs/_components/program-row";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/confirm/use-confirm";
import { useProgramMutations, useProgramsStore } from "@/hooks/program/store";
import { useProgramGroupMutations } from "@/hooks/program-group/store";
import { ProgramUI } from "@/lib/program/type";
import { deleteProgramGroup } from "@/lib/program-group/api";
import {
	readProgramsUiPrefs,
	setGroupCollapsed,
	UNGROUPED_GROUP_ID,
} from "@/lib/programs/ui-preferences";
import { cn } from "@/lib/utils";

type ProgramGroupSectionProps = {
	sectionId: string;
	name: string;
	programs: ProgramUI[];
	onOpenProgram: (programId: string) => void;
};

export function ProgramGroupSection({
	sectionId,
	name,
	programs,
	onOpenProgram,
}: ProgramGroupSectionProps) {
	const [isCollapsed, setIsCollapsed] = React.useState(() =>
		readProgramsUiPrefs().collapsedGroupIds.includes(sectionId),
	);
	const { ref: droppableRef, isDropTarget } = useDroppable({
		id: sectionId,
		type: "column",
		accept: "item",
		collisionPriority: 1,
	});
	const confirm = useConfirm();
	const { deleteItem } = useProgramGroupMutations();
	const { setItems: setPrograms } = useProgramMutations();
	const { items: allPrograms } = useProgramsStore();
	const isRealGroup = sectionId !== UNGROUPED_GROUP_ID;

	const toggleCollapsed = () => {
		const nextCollapsed = !isCollapsed;
		setIsCollapsed(nextCollapsed);
		setGroupCollapsed(sectionId, nextCollapsed);
	};

	const handleDelete = async () => {
		const confirmed = await confirm({
			title: "Delete Group",
			message: `Are you sure you want to delete "${name}"? Its ${programs.length} ${programs.length === 1 ? "program" : "programs"} will be deleted too. This action cannot be undone`,
		});

		if (!confirmed) return;

		deleteItem(sectionId, {
			persist: () => deleteProgramGroup(sectionId),
			onSuccess: () => {
				toast.success("Group deleted successfully.");
				if (allPrograms.some((program) => program.groupId === sectionId)) {
					setPrograms(allPrograms.filter((program) => program.groupId !== sectionId));
				}
			},
			onError: () => toast.error("Failed to delete group."),
		});
	};

	return (
		<section className="space-y-3">
			<div className="hover:bg-accent flex w-full items-center gap-2 rounded-lg px-1 py-2 transition-colors">
				<button
					type="button"
					className="flex flex-1 items-center gap-2 text-left"
					aria-label={`${isCollapsed ? "Show" : "Hide"} ${name} group`}
					aria-expanded={!isCollapsed}
					onClick={toggleCollapsed}
				>
					<ChevronDown
						className={cn(
							"text-muted-foreground size-5 shrink-0 transition-transform",
							isCollapsed && "-rotate-90",
						)}
						aria-hidden
					/>
					<span className="text-foreground text-base font-semibold">{name}</span>
					<span className="text-muted-foreground text-sm">
						{programs.length} {programs.length === 1 ? "program" : "programs"}
					</span>
				</button>
				{isRealGroup && (
					<Button
						type="button"
						aria-label={`Delete ${name} group`}
						variant="ghost"
						size="icon"
						className="text-muted-foreground hover:text-destructive"
						onClick={handleDelete}
					>
						<Trash2Icon className="size-4" />
					</Button>
				)}
			</div>

			{!isCollapsed && (
				<div
					ref={droppableRef}
					className={cn(
						"flex min-h-16 flex-col gap-4 rounded-lg transition-colors",
						isDropTarget && "bg-accent/40 ring-chart-1 ring-1 ring-inset",
					)}
				>
					{programs.length === 0 ? (
						<p className="text-muted-foreground px-1 text-sm">No programs in this group yet.</p>
					) : (
						programs.map((program, index) => (
							<ProgramRow
								key={program.id}
								program={program}
								index={index}
								sectionId={sectionId}
								onOpen={onOpenProgram}
							/>
						))
					)}
				</div>
			)}
		</section>
	);
}
