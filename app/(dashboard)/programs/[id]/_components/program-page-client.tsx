"use client";

import { useEffect, useState } from "react";

import { ProgramDetails } from "@/app/(dashboard)/programs/[id]/_components/program-details";
import { ProgramNotFound } from "@/app/(dashboard)/programs/[id]/_components/program-not-found";
import { getProgramById } from "@/lib/program/api";
import { ProgramWithExercises } from "@/lib/program/type";

type ProgramPageClientProps = {
	programId: string;
};

export function ProgramPageClient({ programId }: ProgramPageClientProps) {
	const [program, setProgram] = useState<ProgramWithExercises | null | undefined>(undefined);

	useEffect(() => {
		void getProgramById(programId).then(setProgram);
	}, [programId]);

	if (program === undefined) {
		return <div className="py-8 text-sm text-gray-500">Loading program...</div>;
	}

	if (!program) {
		return <ProgramNotFound />;
	}

	return <ProgramDetails program={program} />;
}
