import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from "@nestjs/common";
import type { ProgramGroupUI } from "@fit/shared";

import { AuthGuard } from "@/auth/auth.guard";
import { UserId } from "@/auth/user-id.decorator";
import {
	deleteProgramGroup,
	getProgramGroups,
	saveProgramGroup,
} from "@/program-group/program-group.service";

@Controller("program-groups")
@UseGuards(AuthGuard)
export class ProgramGroupsController {
	@Get()
	list(@UserId() userId: string) {
		return getProgramGroups(userId);
	}

	@Post()
	@HttpCode(204)
	async save(@UserId() userId: string, @Body() group: ProgramGroupUI) {
		await saveProgramGroup(group, userId);
	}

	@Delete(":id")
	@HttpCode(204)
	async remove(@UserId() userId: string, @Param("id") id: string) {
		await deleteProgramGroup(id, userId);
	}
}
