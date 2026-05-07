import { ProgramPageClient } from "@/app/(dashboard)/programs/[id]/_components/program-page-client";

type ProgramPageProps = {
	params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
	return [{ id: "placeholder" }];
}

export default async function ProgramPage({ params }: ProgramPageProps) {
	const { id } = await params;
	return <ProgramPageClient programId={id} />;
}
