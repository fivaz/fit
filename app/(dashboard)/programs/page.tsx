"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { ProgramDetailPanel } from "@/app/(dashboard)/programs/_components/program-detail-panel";
import { ProgramList } from "@/app/(dashboard)/programs/_components/program-list";
import { ProgramsProvider, useProgramsStore } from "@/hooks/program/store";
import { getPrograms } from "@/lib/program/api";
import { ProgramUI } from "@/lib/program/type";
import { pushProgramsSelectedId, readProgramsSelectedId } from "@/lib/programs/navigation";

function ProgramsHeader() {
	const { items: programs } = useProgramsStore();

	return (
		<div className="flex items-start justify-between pb-4">
			<div>
				<h1 className="text-foreground text-2xl font-bold">Programs</h1>
				<p className="text-muted-foreground mt-1 text-sm">{programs.length} workout programs</p>
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
	const [programs, setPrograms] = useState<ProgramUI[]>([]);

	useEffect(() => {
		let isCurrent = true;

		void getPrograms()
			.then((loadedPrograms) => {
				if (isCurrent) setPrograms(loadedPrograms);
			})
			.catch(() => {
				if (isCurrent) setPrograms([]);
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
		</ProgramsProvider>
	);
}
