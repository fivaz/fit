"use client";

import { HomeExerciseLibraryTeaser } from "@/app/(dashboard)/_components/home/home-exercise-library-teaser";
import { HomeRecentWorkoutsSection } from "@/app/(dashboard)/_components/home/home-recent-workouts-section";
import { HomeWeekStats } from "@/app/(dashboard)/_components/home/home-week-stats";
import { HomeWelcomeHero } from "@/app/(dashboard)/_components/home/home-welcome-hero";

/** Home shell; exercise library teaser still uses template data; hero, week stats, and recent workouts use live data. */
export function HomePageTemplate() {
	return (
		<div className="flex w-full flex-col">
			<HomeWelcomeHero />
			<HomeWeekStats />
			<HomeRecentWorkoutsSection />
			<HomeExerciseLibraryTeaser />
		</div>
	);
}
