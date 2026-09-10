import { Prisma } from "@/generated/prisma/client";

export const exerciseUIArgs = {
	select: {
		id: true,
		name: true,
		muscles: true,
		imageUrl: true,
		userId: true,
		instructions: true,
	},
} satisfies Prisma.ExerciseDefaultArgs;
