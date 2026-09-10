import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProgramsSkeleton() {
	return (
		<div className="space-y-2">
			<ProgramRowSkeleton />
			<ProgramRowSkeleton />
			<ProgramRowSkeleton />
		</div>
	);
}

function ProgramRowSkeleton() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className="h-6 w-48" />
				<Skeleton className="mt-2 h-4 w-32" />
				<div className="absolute top-4 right-4 flex space-x-2">
					<Skeleton className="h-8 w-8 rounded-md" />
					<Skeleton className="h-8 w-8 rounded-md" />
				</div>
			</CardHeader>
			<CardContent>
				<Skeleton className="h-10 w-full" />
			</CardContent>
		</Card>
	);
}
