import { cn } from "@/lib/utils";

const MUSCLE_IMAGES: Record<string, string> = {
	chest: "/programs/chest.jpg",
	shoulders: "/programs/chest.jpg",
	traps: "/programs/back.jpg",
	back: "/programs/back.jpg",
	biceps: "/programs/arms.jpg",
	triceps: "/programs/arms.jpg",
	forearms: "/programs/arms.jpg",
	quads: "/programs/legs.jpg",
	hamstrings: "/programs/legs.jpg",
	glutes: "/programs/legs.jpg",
	calves: "/programs/legs.jpg",
	abs: "/programs/abs.jpg",
};

const DEFAULT_IMAGE = "/programs/chest.jpg";

type ProgramThumbnailProps = {
	muscles: string[];
	className?: string;
};

export function ProgramThumbnail({ muscles, className }: ProgramThumbnailProps) {
	const image = MUSCLE_IMAGES[muscles[0] ?? ""] ?? DEFAULT_IMAGE;

	return <img src={image} alt="" className={cn("h-full w-full object-cover", className)} />;
}
