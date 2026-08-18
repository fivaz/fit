import React from "react";

import { Dumbbell } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExerciseUI } from "@/lib/exercise/type";

interface ExerciseDrawerProps {
	exercise: ExerciseUI;
	open: boolean;
	setOpen?: (open: boolean) => void;
}

export function ExerciseDetails({ exercise, setOpen, open }: ExerciseDrawerProps) {
	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerContent>
				<div className="mx-auto w-full max-w-md">
					<DrawerHeader className="text-left">
						<DrawerTitle className="flex items-center gap-2 text-2xl font-bold capitalize">
							<Dumbbell className="text-primary h-5 w-5" />
							{exercise.name}
						</DrawerTitle>

						<div className="mt-2 flex flex-wrap gap-2">
							{exercise.muscles.map((muscle) => (
								<Badge key={muscle} variant="secondary" className="capitalize">
									{muscle.toLowerCase()}
								</Badge>
							))}
						</div>
					</DrawerHeader>

					{/* Scrollable Area with Max Height */}
					<ScrollArea className="h-[60vh] px-4">
						<div className="space-y-6 pb-6">
							{/* Image Section */}
							{exercise.imageUrl && (
								<div className="bg-muted w-full overflow-hidden rounded-lg border">
									<img
										src={exercise.imageUrl}
										alt={exercise.name}
										className="block h-auto w-full"
									/>
								</div>
							)}

							{/* Instructions Section */}
							<div className="space-y-3">
								<h4 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
									Instructions
								</h4>
								{exercise.instructions && exercise.instructions.length > 0 ? (
									<ol className="space-y-4">
										{exercise.instructions.map((step, index) => (
											<li key={index} className="flex gap-4 text-sm leading-relaxed">
												<span className="bg-primary/10 text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
													{index + 1}
												</span>
												<p className="text-foreground/90 pt-0.5">{step}</p>
											</li>
										))}
									</ol>
								) : (
									<p className="text-muted-foreground text-sm italic">
										No instructions available for this exercise.
									</p>
								)}
							</div>
						</div>
					</ScrollArea>

					<DrawerFooter className="bg-background border-t pt-4">
						<DrawerClose asChild>
							<Button variant="outline">Close</Button>
						</DrawerClose>
					</DrawerFooter>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
