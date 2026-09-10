export const MuscleGroup = {
	chest: "chest",
	back: "back",
	shoulders: "shoulders",
	biceps: "biceps",
	triceps: "triceps",
	quads: "quads",
	hamstrings: "hamstrings",
	glutes: "glutes",
	calves: "calves",
	abs: "abs",
	forearms: "forearms",
	traps: "traps",
} as const;

export type MuscleGroupType = keyof typeof MuscleGroup;

export const MUSCLE_METADATA: Record<MuscleGroupType, { label: string; image: string }> = {
	chest: { label: "Chest", image: "/muscles/chest.png" },
	back: { label: "Back", image: "/muscles/back.png" },
	shoulders: { label: "Shoulders", image: "/muscles/shoulders.png" },
	biceps: { label: "Biceps", image: "/muscles/biceps.png" },
	triceps: { label: "Triceps", image: "/muscles/triceps.png" },
	forearms: { label: "Forearms", image: "/muscles/forearms.png" },
	quads: { label: "Quads", image: "/muscles/quads.png" },
	hamstrings: { label: "Hamstrings", image: "/muscles/hamstrings.png" },
	glutes: { label: "Glutes", image: "/muscles/glutes.png" },
	calves: { label: "Calves", image: "/muscles/calves.png" },
	abs: { label: "Abs", image: "/muscles/abs.png" },
	traps: { label: "Traps", image: "/muscles/traps.png" },
};

export const MUSCLE_GROUPS = Object.values(MuscleGroup).map((key) => ({
	id: key,
	...MUSCLE_METADATA[key],
}));

export const ALL_MUSCLES = Object.keys(MuscleGroup) as MuscleGroupType[];
