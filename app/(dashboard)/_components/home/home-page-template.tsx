"use client";

import { HomeExerciseLibraryTeaser } from "@/app/(dashboard)/_components/home/home-exercise-library-teaser";
import { HomeProgramsSection } from "@/app/(dashboard)/_components/home/home-programs-section";
import { HomeWeekStats } from "@/app/(dashboard)/_components/home/home-week-stats";
import { HomeWelcomeHero } from "@/app/(dashboard)/_components/home/home-welcome-hero";

/** Home shell; programs/library sections still use template data; hero + week stats use live data. */
export function HomePageTemplate() {
	return (
		<div className="flex w-full flex-col">
			<HomeWelcomeHero />
			<HomeWeekStats />
			<HomeProgramsSection />
			<HomeExerciseLibraryTeaser />
		</div>
	);
}
