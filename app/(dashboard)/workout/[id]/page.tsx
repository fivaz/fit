import { WorkoutPageClient } from "@/app/(dashboard)/workout/[id]/_components/workout-page-client";

type ProgramPageProps = {
	params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
	return [{ id: "placeholder" }];
}

export default async function WorkoutPage({ params }: ProgramPageProps) {
	const { id } = await params;
	return <WorkoutPageClient workoutId={id} />;
}
