import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, Res, UseGuards } from "@nestjs/common";
import type { WorkoutSetMap } from "@fit/shared";
import type { Response } from "express";

import { ApiError } from "@/api-error";
import { AuthGuard } from "@/auth/auth.guard";
import { UserId } from "@/auth/user-id.decorator";
import {
	finishWorkout,
	getActiveWorkout,
	getWorkoutById,
	startWorkout,
	syncWorkoutSets,
} from "@/workout/workout.service";

@Controller("workouts")
@UseGuards(AuthGuard)
export class WorkoutsController {
	@Post()
	@HttpCode(201)
	async start(@UserId() userId: string, @Body() body: { programId?: string }) {
		if (!body.programId) {
			throw new ApiError("programId is required", 400);
		}
		const id = await startWorkout(body.programId, userId);
		return { id };
	}

	@Get("active")
	async active(@UserId() userId: string, @Res({ passthrough: true }) res: Response) {
		const workout = await getActiveWorkout(userId);
		if (!workout) {
			// Nest omits the body when a handler returns null (empty 200), which is not valid JSON.
			res.status(HttpStatus.NO_CONTENT);
			return;
		}
		return workout;
	}

	@Get(":id")
	async getById(@UserId() userId: string, @Param("id") id: string) {
		const workout = await getWorkoutById(id, userId);
		if (!workout) {
			throw new ApiError("Workout not found", 404);
		}
		return workout;
	}

	@Put(":id/sets")
	async syncSets(
		@UserId() userId: string,
		@Param("id") id: string,
		@Body() body: { exerciseSetsMap?: WorkoutSetMap },
	) {
		if (!body.exerciseSetsMap) {
			throw new ApiError("exerciseSetsMap is required", 400);
		}
		return syncWorkoutSets(id, body.exerciseSetsMap, userId);
	}

	@Post(":id/finish")
	@HttpCode(204)
	async finish(@UserId() userId: string, @Param("id") id: string) {
		await finishWorkout(id, userId);
	}
}
