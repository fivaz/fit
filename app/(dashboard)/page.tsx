"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/lib/consts";
import { getActiveWorkout } from "@/lib/workout/api";

export default function HomePage() {
	const router = useRouter();

	useEffect(() => {
		void getActiveWorkout().then((activeWorkout) => {
			if (!activeWorkout) return;
			router.replace(`${ROUTES.WORKOUT}/${activeWorkout.id}`);
		});
	}, [router]);

	return (
		<div className="relative flex w-full flex-col">
			<div className="flex items-start justify-between pb-4">
				<div>
					<h1 className="text-foreground text-2xl font-bold">Home</h1>
					<small className="mt-1 text-red-500">(not implemented yet)</small>
				</div>
			</div>
		</div>
	);
}
