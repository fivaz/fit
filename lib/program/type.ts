import { ExerciseUI, exerciseUIArgs } from "@/lib/exercise/type";
import { Prisma } from "@/lib/generated/prisma/client";
import { MuscleGroup } from "@/lib/generated/prisma/client";

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

export type ProgramUI = Prisma.ProgramGetPayload<typeof programUISelect>;

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

type ProgramWithExercisesRaw = Prisma.ProgramGetPayload<typeof programWithExercisesArgs>;

export type OrderedExercise = ExerciseUI & { order: number };

export type ProgramWithExercises = Omit<ProgramWithExercisesRaw, "exercises"> & {
	exercises: OrderedExercise[];
};

export function buildEmptyProgram(): ProgramUI {
	return {
		id: "",
		name: "",
		muscles: [],
		order: 0,
		imageUrl: null,
		groupId: null,
	};
}

export function formToProgram(formData: FormData): ProgramUI {
	const groupId = (formData.get("groupId") as string) || null;

	return {
		id: (formData.get("id") as string) || "",
		name: (formData.get("name") as string) || "",
		muscles: formData.getAll("muscles") as MuscleGroup[],
		order: 0,
		imageUrl: null,
		groupId: groupId || null,
	};
}
