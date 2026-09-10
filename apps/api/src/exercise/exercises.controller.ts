import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, UseGuards } from "@nestjs/common";
import { type ExerciseUI, type MuscleGroupType,PAGE_SIZE } from "@fit/shared";

import { AuthGuard } from "@/auth/auth.guard";
import { UserId } from "@/auth/user-id.decorator";
import { deleteExercise, getExercisesSearch, saveExercise } from "@/exercise/exercise.service";

@Controller("exercises")
@UseGuards(AuthGuard)
export class ExercisesController {
	@Get()
	list(
		@UserId() userId: string,
		@Query("page") pageRaw?: string,
		@Query("pageSize") pageSizeRaw?: string,
		@Query("search") search?: string,
		@Query("muscles") muscles?: string | string[],
	) {
		const page = Number(pageRaw || "1");
		const pageSize = Number(pageSizeRaw || String(PAGE_SIZE));
		const muscleList = muscles === undefined ? [] : Array.isArray(muscles) ? muscles : [muscles];

		return getExercisesSearch(userId, {
			search,
			muscles: muscleList as MuscleGroupType[],
			page,
			pageSize,
		});
	}

	@Post()
	@HttpCode(204)
	async save(@UserId() userId: string, @Body() exercise: ExerciseUI) {
		await saveExercise(exercise, userId);
	}

	@Delete(":id")
	@HttpCode(204)
	async remove(@UserId() userId: string, @Param("id") id: string) {
		await deleteExercise(id, userId);
	}
}
