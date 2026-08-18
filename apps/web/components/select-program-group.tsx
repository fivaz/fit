"use client";

import { useEffect, useState } from "react";

import { Label } from "@/components/ui/label";
import { getProgramGroups } from "@/lib/program-group/api";
import { ProgramGroupUI } from "@/lib/program-group/type";
import { cn } from "@/lib/utils";

type SelectProgramGroupProps = {
	defaultValue?: string | null;
};

export function SelectProgramGroup({ defaultValue = null }: SelectProgramGroupProps) {
	const [groups, setGroups] = useState<ProgramGroupUI[]>([]);

	useEffect(() => {
		let isCurrent = true;

		void getProgramGroups()
			.then((loadedGroups) => {
				if (isCurrent) setGroups(loadedGroups);
			})
			.catch(() => {
				if (isCurrent) setGroups([]);
			});

		return () => {
			isCurrent = false;
		};
	}, []);

	return (
		<div className="grid gap-2">
			<Label htmlFor="groupId">Group</Label>
			<select
				id="groupId"
				name="groupId"
				defaultValue={defaultValue ?? ""}
				className={cn(
					"border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm",
					"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
				)}
			>
				<option value="">No group</option>
				{groups.map((group) => (
					<option key={group.id} value={group.id}>
						{group.name}
					</option>
				))}
			</select>
		</div>
	);
}
