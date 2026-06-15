"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WorkoutViewDetail } from "@/components/workout/workout-view-detail";
import { ROUTES } from "@/lib/consts";
import { getWorkoutById } from "@/lib/workout/api";
import { WorkoutWithMappedSets } from "@/lib/workout/type";

export default function WorkoutViewPage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const [workout, setWorkout] = useState<WorkoutWithMappedSets | null | undefined>(undefined);

	useEffect(() => {
		let cancelled = false;

		void getWorkoutById(params.id)
			.then((loaded) => {
				if (cancelled) return;
				if (loaded && !loaded.endDate) {
					router.replace(ROUTES.HOME);
					return;
				}
				setWorkout(loaded);
			})
			.catch(() => {
				if (!cancelled) setWorkout(null);
			});

		return () => {
			cancelled = true;
		};
	}, [params.id, router]);

	if (workout === undefined) {
		return (
			<div className="flex min-h-[40vh] items-center justify-center">
				<Loader2 className="h-6 w-6 animate-spin text-orange-500" aria-label="Loading workout" />
			</div>
		);
	}

	if (!workout) {
		return (
			<div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6 text-center">
				<p className="text-gray-500 dark:text-gray-400">Workout not found</p>
				<Button variant="outline" asChild>
					<Link href={ROUTES.PROGRESS}>
						<ArrowLeft className="h-4 w-4" />
						Back to progress
					</Link>
				</Button>
			</div>
		);
	}

	return <WorkoutViewDetail workout={workout} />;
}
