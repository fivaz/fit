import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Patch,
	Post,
	Put,
	UseGuards,
} from "@nestjs/common";
import type { ProgramUI } from "@fit/shared";

import { ApiError } from "@/api-error";
import { AuthGuard } from "@/auth/auth.guard";
import { UserId } from "@/auth/user-id.decorator";
import { getExerciseCatalogForUser } from "@/exercise/catalog";
import { reorderProgramExercises } from "@/exercise/exercise.service";
import { generateProgramsFromDescription, ProgramGenerationError } from "@/program/generate";
import { generateProgramRequestSchema } from "@/program/generate-schema";
import {
	createGeneratedPrograms,
	deleteProgram,
	getProgramById,
	getPrograms,
	reorderPrograms,
	saveProgram,
	updateProgramExercises,
} from "@/program/program.service";

@Controller("programs")
@UseGuards(AuthGuard)
export class ProgramsController {
	@Get()
	list(@UserId() userId: string) {
		return getPrograms(userId);
	}

	@Post()
	@HttpCode(204)
	async save(@UserId() userId: string, @Body() program: ProgramUI) {
		await saveProgram(program, userId);
	}

	@Patch("reorder")
	@HttpCode(204)
	async reorder(
		@UserId() userId: string,
		@Body() body: { groupId?: string | null; sortedIds?: string[] },
	) {
		if (!body.sortedIds) {
			throw new ApiError("sortedIds is required", 400);
		}
		await reorderPrograms(body.groupId ?? null, body.sortedIds, userId);
	}

	@Post("generate")
	async generate(@UserId() userId: string, @Body() body: unknown) {
		const parsed = generateProgramRequestSchema.safeParse(body);
		if (!parsed.success) {
			throw new ApiError(
				parsed.error.flatten().fieldErrors.description?.[0] ?? "Invalid request",
				400,
			);
		}

		try {
			const catalog = await getExerciseCatalogForUser(userId);
			const generated = await generateProgramsFromDescription(parsed.data.description, catalog);
			return createGeneratedPrograms(generated, userId);
		} catch (error) {
			if (error instanceof ProgramGenerationError) {
				throw new ApiError(error.message, error.status);
			}
			throw error;
		}
	}

	@Get(":id")
	async getById(@UserId() userId: string, @Param("id") id: string) {
		const program = await getProgramById(id, userId);
		if (!program) {
			throw new ApiError("Program not found", 404);
		}
		return program;
	}

	@Delete(":id")
	@HttpCode(204)
	async remove(@UserId() userId: string, @Param("id") id: string) {
		await deleteProgram(id, userId);
	}

	@Put(":id/exercises")
	@HttpCode(204)
	async replaceExercises(
		@UserId() userId: string,
		@Param("id") id: string,
		@Body() body: { exerciseIds?: string[] },
	) {
		if (!body.exerciseIds) {
			throw new ApiError("exerciseIds is required", 400);
		}
		await updateProgramExercises(body.exerciseIds, id, userId);
	}

	@Patch(":id/exercises/reorder")
	@HttpCode(204)
	async reorderExercises(
		@UserId() userId: string,
		@Param("id") id: string,
		@Body() body: { exerciseIds?: string[] },
	) {
		if (!body.exerciseIds) {
			throw new ApiError("exerciseIds is required", 400);
		}
		await reorderProgramExercises(id, body.exerciseIds, userId);
	}
}
