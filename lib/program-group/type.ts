import { Prisma } from "@/lib/generated/prisma/client";

export const programGroupUISelect = {
	select: {
		id: true,
		name: true,
		order: true,
	},
} satisfies Prisma.ProgramGroupDefaultArgs;

export type ProgramGroupUI = Prisma.ProgramGroupGetPayload<typeof programGroupUISelect>;

export function buildEmptyProgramGroup(): ProgramGroupUI {
	return {
		id: "",
		name: "",
		order: 0,
	};
}

export function formToProgramGroup(formData: FormData): ProgramGroupUI {
	return {
		id: (formData.get("id") as string) || "",
		name: (formData.get("name") as string) || "",
		order: 0,
	};
}
