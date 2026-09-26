"use client";

import { useCallback, useEffect, useState } from "react";

import { ArrowLeftIcon } from "lucide-react";

import { ProgramDetailsInternal } from "@/app/(dashboard)/programs/[id]/_components/program-details";
import { ProgramNotFound } from "@/app/(dashboard)/programs/[id]/_components/program-not-found";
import { Button } from "@/components/ui/button";
import { useOfflineCache } from "@/hooks/offline/use-offline-cache";
import { useProgramsStore } from "@/hooks/program/store";
import type { OfflineSnapshot } from "@/lib/offline/data-adapters";
import { getProgramById } from "@/lib/program/api";
import { ProgramUI, ProgramWithExercises } from "@/lib/program/type";

type ProgramDetailPanelProps = {
	programId: string;
	onBack: () => void;
};

type ProgramLoadResult = {
	programId: string;
	program: ProgramWithExercises | null;
};

function programFromSummary(summary: ProgramUI): ProgramWithExercises {
	return { ...summary, exercises: [] };
}

export function ProgramDetailPanel({ programId, onBack }: ProgramDetailPanelProps) {
	const { items } = useProgramsStore();
	const summary = items.find((program) => program.id === programId);
	const summaryProgram = summary ? programFromSummary(summary) : undefined;
	const [loadResult, setLoadResult] = useState<ProgramLoadResult | null>(null);
	const selectCachedProgram = useCallback(
		(snapshot: OfflineSnapshot) => snapshot.programDetailsById[programId] ?? null,
		[programId],
	);
	// A saved copy of this program shows right away; the API's answer replaces it once it arrives.
	const cachedProgram = useOfflineCache(selectCachedProgram, null);
	const loadedProgram =
		loadResult?.programId === programId ? loadResult.program : (cachedProgram ?? undefined);
	const program =
		loadedProgram && summaryProgram
			? { ...summaryProgram, exercises: loadedProgram.exercises }
			: (loadedProgram ?? summaryProgram ?? null);
	const exercisesLoading = loadResult?.programId !== programId && !cachedProgram;

	useEffect(() => {
		let isCurrent = true;

		void getProgramById(programId)
			.then((loaded) => {
				if (!isCurrent) return;
				setLoadResult({ programId, program: loaded });
			})
			.catch(() => {
				if (!isCurrent) return;
				setLoadResult({ programId, program: null });
			});

		return () => {
			isCurrent = false;
		};
	}, [programId]);

	if (!program) {
		if (exercisesLoading) {
			return <div className="py-8 text-sm text-gray-500">Loading program...</div>;
		}

		return <ProgramNotFound onBack={onBack} />;
	}

	return (
		<div className="relative flex w-full flex-col">
			<Button
				type="button"
				variant="ghost"
				size="sm"
				className="mb-2 -ml-2 w-fit"
				onClick={onBack}
				aria-label="Back to programs"
			>
				<ArrowLeftIcon className="size-4" />
				Programs
			</Button>
			{exercisesLoading && program.exercises.length === 0 ? (
				<p className="text-muted-foreground mb-4 text-sm">Loading exercises...</p>
			) : null}
			<ProgramDetailsInternal
				program={program}
				onClose={onBack}
				exercisesLoading={exercisesLoading}
			/>
		</div>
	);
}
