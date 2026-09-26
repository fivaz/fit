import type { Metadata } from "next";
import Link from "next/link";

import { Dumbbell, Globe, LineChart, Smartphone, Sparkles, WifiOff } from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { APP_NAME, ROUTES, TESTFLIGHT_URL } from "@/lib/consts";

export const metadata: Metadata = {
	title: `About ${APP_NAME}`,
	description:
		"Fit-Tracker is a workout tracking app: build training programs, log workouts, track body metrics, and generate programs with AI.",
};

const SUPPORT_EMAIL = "contact@sfivaz.com";

const FEATURES = [
	{
		icon: Dumbbell,
		title: "Programs and workouts",
		text: "Build training programs from an exercise library and log every set, rep and weight.",
	},
	{
		icon: LineChart,
		title: "Progress tracking",
		text: "Follow body metrics and per-exercise trends over time with clear charts.",
	},
	{
		icon: Sparkles,
		title: "AI program generation",
		text: "Describe the training you want and get a complete program built from your exercise library.",
	},
	{
		icon: WifiOff,
		title: "Works offline",
		text: "Keep logging sets on the go, even without a connection. Data syncs when you're back online.",
	},
];

export default function AboutPage() {
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<div className="mx-auto w-full max-w-3xl px-6 py-16">
				<header className="flex flex-col items-center text-center">
					<div className="bg-primary text-primary-foreground mb-4 flex size-14 items-center justify-center rounded-xl">
						<Logo className="size-8" />
					</div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">{APP_NAME}</h1>
					<p className="mt-3 max-w-lg text-gray-600 dark:text-gray-300">
						A workout tracker for building training programs, logging your sessions, and following
						your progress, on the web and on iOS.
					</p>

					<div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
						<Button asChild size="lg">
							<Link href={ROUTES.LOGIN} aria-label="Open the web app">
								<Globe /> Open Web App
							</Link>
						</Button>
						<Button asChild size="lg" variant="outline">
							<a
								href={TESTFLIGHT_URL}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Get the iOS beta on TestFlight"
							>
								<Smartphone /> Get iOS Beta
							</a>
						</Button>
					</div>
					<p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
						The iOS beta requires the free TestFlight app from Apple.
					</p>
				</header>

				<section aria-labelledby="features-heading" className="mt-16">
					<h2 id="features-heading" className="sr-only">
						Features
					</h2>
					<ul className="grid gap-4 sm:grid-cols-2">
						{FEATURES.map(({ icon: Icon, title, text }) => (
							<li key={title} className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
								<Icon className="text-primary mb-2 size-5" aria-hidden />
								<h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
								<p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{text}</p>
							</li>
						))}
					</ul>
				</section>

				<footer className="mt-16 space-y-3 text-center text-sm text-gray-500 dark:text-gray-400">
					<p>
						Questions? Contact us at{" "}
						<a href={`mailto:${SUPPORT_EMAIL}`} className="underline underline-offset-4">
							{SUPPORT_EMAIL}
						</a>
						.
					</p>
					<p className="flex justify-center gap-6">
						<Link href={ROUTES.PRIVACY} className="underline underline-offset-4">
							Privacy Policy
						</Link>
						<Link href={ROUTES.TERMS} className="underline underline-offset-4">
							Terms &amp; Refunds
						</Link>
					</p>
				</footer>
			</div>
		</div>
	);
}
