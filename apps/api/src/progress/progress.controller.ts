import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import * as z from "zod";

import { ApiError } from "@/api-error";
import { AuthGuard } from "@/auth/auth.guard";
import { UserId } from "@/auth/user-id.decorator";
import {
	getProgramExerciseProgress,
	getProgressStats,
	getProgressWorkoutLogs,
} from "@/progress/progress.service";

const programIdSchema = z.string().trim().min(1).max(200);

function parseRange(fromParam?: string, toParam?: string) {
	if (!fromParam || !toParam) {
		throw new ApiError("from and to query parameters are required", 400);
	}

	const from = new Date(fromParam);
	const to = new Date(toParam);

	if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
		throw new ApiError("Invalid from or to date", 400);
	}

	return { from, to };
}

@Controller("progress")
@UseGuards(AuthGuard)
export class ProgressController {
	@Get("stats")
	stats(@UserId() userId: string, @Query("from") from?: string, @Query("to") to?: string) {
		const range = parseRange(from, to);
		return getProgressStats(userId, range.from, range.to);
	}

	@Get("logs")
	logs(@UserId() userId: string, @Query("from") from?: string, @Query("to") to?: string) {
		const range = parseRange(from, to);
		return getProgressWorkoutLogs(userId, range.from, range.to);
	}

	@Get("programs/:programId/exercises")
	programExercises(@UserId() userId: string, @Param("programId") programId: string) {
		const parsed = programIdSchema.safeParse(programId);
		if (!parsed.success) {
			throw new ApiError("Invalid programId", 400);
		}
		return getProgramExerciseProgress(userId, parsed.data);
	}
}
