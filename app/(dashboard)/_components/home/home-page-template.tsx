"use client";

import { HomeExerciseLibraryTeaser } from "@/app/(dashboard)/_components/home/home-exercise-library-teaser";
import { HomeProgramsSection } from "@/app/(dashboard)/_components/home/home-programs-section";
import { HomeWeekStats } from "@/app/(dashboard)/_components/home/home-week-stats";
import { HomeWelcomeHero } from "@/app/(dashboard)/_components/home/home-welcome-hero";

/** Placeholder home shell; section components hold template/mock data until wired to real sources. */
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
