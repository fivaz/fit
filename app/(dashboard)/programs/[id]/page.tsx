import * as React from "react";

import { ProgramDetails } from "@/app/(dashboard)/programs/[id]/_components/program-details";
import { ProgramNotFound } from "@/app/(dashboard)/programs/[id]/_components/program-not-found";
import { getProgramById } from "@/lib/program/service";
import { getUserId } from "@/lib/utils-server";

type ProgramPageProps = {
	params: Promise<{ id: string }>;
};

export default async function ProgramPage({ params }: ProgramPageProps) {
	const { id } = await params;
	const userId = await getUserId();

	const program = await getProgramById(id, userId);

	if (!program) {
		return <ProgramNotFound />;
	}

	return <ProgramDetails program={program} />;
}
