import { type FormEvent, useState } from "react";

import { SparklesIcon } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const descriptionSchema = z.object({
	description: z.string().min(10, "Please describe your workout in at least 10 characters"),
});

type ProgramFormAutomaticProps = {
	onClose: () => void;
};

export function ProgramFormAutomatic({ onClose }: ProgramFormAutomaticProps) {
	const [error, setError] = useState<string>();

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const description = String(formData.get("description") ?? "").trim();
		const result = descriptionSchema.safeParse({ description });

		if (!result.success) {
			setError(result.error.flatten().fieldErrors.description?.[0]);
			return;
		}

		setError(undefined);
		onClose();
		toast.info("AI program generation is coming soon.");
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6 px-4">
			<div className="bg-muted/50 flex gap-3 rounded-lg p-4">
				<SparklesIcon className="text-primary mt-0.5 size-5 shrink-0" aria-hidden />
				<div className="space-y-1 text-sm">
					<p className="text-foreground font-medium">Describe how you want your workout to be.</p>
					<p className="text-muted-foreground">
						Our AI coach will craft the perfect program for you.
					</p>
				</div>
			</div>

			<div className="grid gap-2">
				<Label htmlFor="workout-description">Workout description</Label>
				<Textarea
					id="workout-description"
					name="description"
					placeholder="e.g. A 4-day upper/lower split focused on building strength with compound lifts. I have access to a full gym and want 60-minute sessions."
					className={error ? "border-destructive" : ""}
					rows={6}
				/>
				{error && <p className="text-destructive text-sm">{error}</p>}
			</div>

			<DrawerFooter className="px-0">
				<Button type="submit" className="w-full">
					Generate Program
				</Button>
				<DrawerClose asChild>
					<Button variant="outline" className="w-full">
						Cancel
					</Button>
				</DrawerClose>
			</DrawerFooter>
		</form>
	);
}
