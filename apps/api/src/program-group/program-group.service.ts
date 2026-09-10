import type { ProgramGroupUI } from "@fit/shared";

import { logError } from "@/logger";
import { prisma } from "@/prisma/client";
import { programGroupUISelect } from "@/program/select";
import { devDelay } from "@/utils";

export interface ProgramGroupRepository {
	getProgramGroups(userId: string): Promise<ProgramGroupUI[]>;
	upsertProgramGroup(group: Pick<ProgramGroupUI, "id" | "name">, userId: string): Promise<void>;
	deleteProgramGroup(id: string, userId: string): Promise<void>;
}

const prismaProgramGroupRepository: ProgramGroupRepository = {
	async getProgramGroups(userId) {
		return prisma.programGroup.findMany({
			where: { userId },
			...programGroupUISelect,
			orderBy: { order: "asc" as const },
		});
	},
	async upsertProgramGroup({ id, name }, userId) {
		const groupCount = await prisma.programGroup.count({ where: { userId } });

		await prisma.programGroup.upsert({
			where: { id: id || "new-id", userId },
			update: { name },
			create: { id, name, userId, order: groupCount },
		});
	},
	async deleteProgramGroup(id, userId) {
		await prisma.$transaction([
			prisma.program.updateMany({
				where: { groupId: id, userId },
				data: { groupId: null },
			}),
			prisma.programGroup.delete({ where: { id, userId } }),
		]);
	},
};

export function createProgramGroupService(repository: ProgramGroupRepository) {
	return {
		async getProgramGroups(userId: string): Promise<ProgramGroupUI[]> {
			await devDelay();
			return repository.getProgramGroups(userId);
		},
		async saveProgramGroup({ id, name }: ProgramGroupUI, userId: string) {
			await devDelay();
			try {
				await repository.upsertProgramGroup({ id, name }, userId);
			} catch (error) {
				logError(error, "saveProgramGroup", { extra: { id, name, userId } });
				throw new Error("Failed to save program group");
			}
		},
		async deleteProgramGroup(id: string, userId: string) {
			await devDelay();
			try {
				await repository.deleteProgramGroup(id, userId);
			} catch (error) {
				logError(error, "deleteProgramGroup", { extra: { id, userId } });
				throw new Error("Failed to delete program group");
			}
		},
	};
}

const programGroupService = createProgramGroupService(prismaProgramGroupRepository);

export const getProgramGroups = programGroupService.getProgramGroups;
export const saveProgramGroup = programGroupService.saveProgramGroup;
export const deleteProgramGroup = programGroupService.deleteProgramGroup;
