import { Prisma } from "@/lib/generated/prisma/client";
import { type MuscleGroup } from "@/lib/generated/prisma/client";

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

export type ExerciseRaw = Prisma.ExerciseGetPayload<typeof exerciseUIArgs>

export type ExerciseUI = Omit<ExerciseRaw, "userId"> & { isPrivate: boolean };

export function buildEmptyExercise(): ExerciseUI {
	return {
		id: "",
		name: "",
		muscles: [],
		imageUrl: null,
		isPrivate: true,
		instructions: [],
	};
}

export function formToExercise(formData: FormData): ExerciseUI {
	return {
		id: (formData.get("id") as string) || "",
		name: (formData.get("name") as string) || "",
		muscles: formData.getAll("muscles") as MuscleGroup[],
		//TODO handle image upload
		imageUrl: null,
		isPrivate: true,
		instructions: [],
	};
}
