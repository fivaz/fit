import Link from "next/link";

import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/consts";

type ProgramNotFoundProps = {
	onBack?: () => void;
};

export function ProgramNotFound({ onBack }: ProgramNotFoundProps) {
	return (
		<div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
			<p className="text-muted-foreground">Program not found</p>
			{onBack ? (
				<Button type="button" variant="outline" onClick={onBack}>
					<ArrowLeftIcon />
					Go Back
				</Button>
			) : (
				<Button asChild>
					<Link href={ROUTES.PROGRAMS}>
						<ArrowLeftIcon />
						Go Back
					</Link>
				</Button>
			)}
		</div>
	);
}
