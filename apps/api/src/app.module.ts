import { Module } from "@nestjs/common";

import { BodyMetricsController } from "@/body-metrics/body-metrics.controller";
import { ExercisesController } from "@/exercise/exercises.controller";
import { HealthController } from "@/health.controller";
import { HomeController } from "@/home/home.controller";
import { ProgramsController } from "@/program/programs.controller";
import { ProgramGroupsController } from "@/program-group/program-groups.controller";
import { ProgressController } from "@/progress/progress.controller";
import { UserController } from "@/user/user.controller";
import { WorkoutsController } from "@/workout/workouts.controller";

@Module({
	controllers: [
		ProgramsController,
		ProgramGroupsController,
		ExercisesController,
		WorkoutsController,
		BodyMetricsController,
		UserController,
		ProgressController,
		HealthController,
		HomeController,
	],
})
export class AppModule {}
