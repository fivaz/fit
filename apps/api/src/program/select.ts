import { exerciseUIArgs } from "@/exercise/select";
import { Prisma } from "@/generated/prisma/client";

export const programUISelect = {
	select: {
		id: true,
		name: true,
		muscles: true,
		imageUrl: true,
		order: true,
		groupId: true,
	},
} satisfies Prisma.ProgramDefaultArgs;

export const programWithExercisesArgs = {
	select: {
		...programUISelect.select,
		exercises: {
			orderBy: {
				order: "asc" as const,
			},
			select: {
				order: true,
				exercise: {
					...exerciseUIArgs,
				},
			},
		},
	},
} satisfies Prisma.ProgramDefaultArgs;

export const programGroupUISelect = {
	select: {
		id: true,
		name: true,
		order: true,
	},
} satisfies Prisma.ProgramGroupDefaultArgs;
