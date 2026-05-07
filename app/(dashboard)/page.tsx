import React from "react";
import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/consts";
import { getUserId } from "@/lib/utils-server";
import { getActiveWorkout } from "@/lib/workout/service";

export default async function HomePage() {
	const userId = await getUserId();
	const activeWorkout = await getActiveWorkout(userId);

	if (activeWorkout) {
		redirect(`${ROUTES.WORKOUT}/${activeWorkout.id}`);
	}

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
