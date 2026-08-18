import { Controller, Get, Query, UseGuards } from "@nestjs/common";

import { AuthGuard } from "@/auth/auth.guard";
import { UserId } from "@/auth/user-id.decorator";
import { countExerciseLibrary } from "@/exercise/exercise.service";
import { getRecentWorkoutsForHome } from "@/progress/progress.service";

@Controller("home")
@UseGuards(AuthGuard)
export class HomeController {
	@Get("recent-workouts")
	recent(@UserId() userId: string, @Query("limit") limitRaw?: string) {
		const parsed = parseInt(limitRaw ?? "5", 10);
		const limit = Number.isFinite(parsed) ? Math.min(50, Math.max(1, parsed)) : 5;
		return getRecentWorkoutsForHome(userId, limit);
	}

	@Get("exercise-count")
	async exerciseCount(@UserId() userId: string) {
		const count = await countExerciseLibrary(userId);
		return { count };
	}
}
