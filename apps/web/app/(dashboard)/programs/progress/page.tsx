"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { ArrowLeftIcon } from "lucide-react";

import { ExerciseProgressCard } from "@/app/(dashboard)/programs/progress/_components/exercise-progress-card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/consts";
import { logError } from "@/lib/logger";
import { programsDetailHref } from "@/lib/programs/navigation";
import { getProgramProgress } from "@/lib/progress/api";
import { ProgramProgressUI } from "@/lib/progress/type";

type LoadState =
	| { programId: string; status: "loaded"; progress: ProgramProgressUI }
	| { programId: string; status: "error" };

export default function ProgramProgressPage() {
	return (
		<Suspense fallback={<div className="py-8 text-sm text-gray-500">Loading progress...</div>}>
			<ProgramProgressContent />
		</Suspense>
	);
}

function ProgramProgressContent() {
	const programId = useSearchParams().get("id")?.trim() || null;
	const [state, setState] = useState<LoadState | null>(null);

	useEffect(() => {
		if (!programId) return;
		let isCurrent = true;

		void getProgramProgress(programId)
			.then((progress) => {
				if (isCurrent) setState({ programId, status: "loaded", progress });
			})
			.catch((error) => {
				logError(error, "ProgramProgressPage#load");
				if (isCurrent) setState({ programId, status: "error" });
			});

		return () => {
			isCurrent = false;
		};
	}, [programId]);

	const backHref = programId ? programsDetailHref(programId) : ROUTES.PROGRAMS;
	const current = state?.programId === programId ? state : null;

	return (
		<div className="pb-6">
			<Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 w-fit">
				<Link href={backHref} aria-label="Back to program">
					<ArrowLeftIcon className="size-4" />
					Program
				</Link>
			</Button>

			{!programId || current?.status === "error" ? (
				<p className="py-8 text-sm text-gray-500">Could not load progress for this program.</p>
			) : current?.status === "loaded" ? (
				<>
					<div className="mb-6">
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exercise progress</h1>
						<p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
							{current.progress.programName} · best weight and reps per workout
						</p>
					</div>
					{current.progress.exercises.length === 0 ? (
						<p className="text-sm text-gray-500">This program has no exercises yet.</p>
					) : (
						<div className="flex flex-col gap-3">
							{current.progress.exercises.map((exercise) => (
								<ExerciseProgressCard key={exercise.exerciseId} exercise={exercise} />
							))}
						</div>
					)}
				</>
			) : (
				<p className="py-8 text-sm text-gray-500">Loading progress...</p>
			)}
		</div>
	);
}
