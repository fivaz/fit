"use client";
import { useRouter } from "next/navigation";

import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function WorkoutNotFound() {
	const router = useRouter();
	return (
		<div className="flex h-screen flex-col items-center justify-center gap-4">
			<p className="text-muted-foreground">Workout not found</p>
			<Button type="button" variant="outline" onClick={() => router.back()}>
				<ArrowLeftIcon className="mr-2 size-4" />
				Go Back
			</Button>
		</div>
	);
}
