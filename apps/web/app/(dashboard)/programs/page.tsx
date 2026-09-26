"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { ProgramDetailPanel } from "@/app/(dashboard)/programs/_components/program-detail-panel";
import { ProgramGroupFormButton } from "@/app/(dashboard)/programs/_components/program-group-form-button";
import { ProgramList } from "@/app/(dashboard)/programs/_components/program-list";
import { ProgramFormButton } from "@/components/program/program-form-button";
import { useOfflineCache } from "@/hooks/offline/use-offline-cache";
import { ProgramsProvider, useProgramsStore } from "@/hooks/program/store";
import { ProgramGroupsProvider } from "@/hooks/program-group/store";
import type { OfflineSnapshot } from "@/lib/offline/data-adapters";
import { getPrograms } from "@/lib/program/api";
import { ProgramUI } from "@/lib/program/type";
import { getProgramGroups } from "@/lib/program-group/api";
import { ProgramGroupUI } from "@/lib/program-group/type";
import { pushProgramsSelectedId, readProgramsSelectedId } from "@/lib/programs/navigation";

const NO_PROGRAMS: ProgramUI[] = [];
const NO_GROUPS: ProgramGroupUI[] = [];

function selectCachedPrograms(snapshot: OfflineSnapshot): ProgramUI[] {
	return snapshot.programs;
}

function selectCachedGroups(snapshot: OfflineSnapshot): ProgramGroupUI[] {
	return snapshot.programGroups;
}

function ProgramsHeader() {
	const { items: programs } = useProgramsStore();

	return (
		<div className="flex items-start justify-between gap-3 pb-4">
			<div>
				<h1 className="text-foreground text-2xl font-bold">Programs</h1>
				<p className="text-muted-foreground mt-1 text-sm">{programs.length} workout programs</p>
			</div>
			<div className="flex items-center gap-2">
				<ProgramGroupFormButton size="sm" />
				<ProgramFormButton size="icon-lg" />
			</div>
		</div>
	);
}

export default function ProgramsPage() {
	return (
		<Suspense fallback={<div className="py-8 text-sm text-gray-500">Loading programs...</div>}>
			<ProgramsPageContent />
		</Suspense>
	);
}

function ProgramsPageContent() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const selectedProgramId = readProgramsSelectedId(pathname, searchParams);
	// Saved copies show right away; the API's answer replaces them once it arrives.
	const cachedPrograms = useOfflineCache(selectCachedPrograms, NO_PROGRAMS);
	const cachedGroups = useOfflineCache(selectCachedGroups, NO_GROUPS);
	const [loadedPrograms, setLoadedPrograms] = useState<ProgramUI[] | null>(null);
	const [loadedGroups, setLoadedGroups] = useState<ProgramGroupUI[] | null>(null);
	const programs = loadedPrograms ?? cachedPrograms;
	const groups = loadedGroups ?? cachedGroups;

	useEffect(() => {
		let isCurrent = true;

		void getPrograms()
			.then((programs) => {
				if (!isCurrent) return;
				setLoadedPrograms(programs);
			})
			.catch(() => {
				if (!isCurrent) return;
				setLoadedPrograms(NO_PROGRAMS);
			});

		void getProgramGroups()
			.then((groups) => {
				if (!isCurrent) return;
				setLoadedGroups(groups);
			})
			.catch(() => {
				if (!isCurrent) return;
				setLoadedGroups(NO_GROUPS);
			});

		return () => {
			isCurrent = false;
		};
	}, []);

	const openProgram = useCallback((programId: string) => {
		pushProgramsSelectedId(programId);
	}, []);

	const closeProgram = useCallback(() => {
		pushProgramsSelectedId(null);
	}, []);

	return (
		<ProgramsProvider initialItems={programs}>
			<ProgramGroupsProvider initialItems={groups}>
				<div className="relative">
					{selectedProgramId ? (
						<ProgramDetailPanel programId={selectedProgramId} onBack={closeProgram} />
					) : (
						<>
							<ProgramsHeader />
							<ProgramList onOpenProgram={openProgram} />
						</>
					)}
				</div>
			</ProgramGroupsProvider>
		</ProgramsProvider>
	);
}
