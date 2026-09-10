"use client";

import { HomeExerciseLibraryTeaser } from "@/app/(dashboard)/_components/home/home-exercise-library-teaser";
import { HomeRecentWorkoutsSection } from "@/app/(dashboard)/_components/home/home-recent-workouts-section";
import { HomeWeekStats } from "@/app/(dashboard)/_components/home/home-week-stats";
import { HomeWelcomeHero } from "@/app/(dashboard)/_components/home/home-welcome-hero";
import { useHomeExerciseCount } from "@/app/(dashboard)/_components/home/use-home-exercise-count";

export function HomePageTemplate() {
	const { count: exerciseCount, isLoading: isExerciseCountLoading } = useHomeExerciseCount();

	return (
		<div className="flex w-full flex-col">
			<HomeWelcomeHero />
			<HomeWeekStats />
			<HomeRecentWorkoutsSection />
			<HomeExerciseLibraryTeaser count={exerciseCount} isLoading={isExerciseCountLoading} />
		</div>
	);
}
