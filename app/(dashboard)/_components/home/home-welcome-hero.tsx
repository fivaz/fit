"use client";

import { useMemo } from "react";

import { motion } from "framer-motion";
import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

function getHomeGreetingName(
	session: {
		user: { name?: string | null; email?: string | null };
	} | null,
): string {
	const name = session?.user?.name?.trim();
	if (name) {
		const first = name.split(/\s+/)[0];
		if (first) return first;
	}
	const email = session?.user?.email?.trim();
	if (email) {
		const local = email.split("@")[0]?.trim();
		if (local) return local;
	}
	return "there";
}

export function HomeWelcomeHero() {
	const { data: session, isPending } = authClient.useSession();

	const greetingName = useMemo(() => getHomeGreetingName(session), [session]);

	return (
		<div className="relative pb-8">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="space-y-1"
			>
				<p className="text-gray-500 dark:text-gray-400">Welcome back,</p>
				{isPending ? (
					<div
						className="h-9 max-w-[12rem] animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
						aria-busy
						aria-label="Loading name"
					/>
				) : (
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">{greetingName}</h1>
				)}
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-xl shadow-orange-500/30"
			>
				<div className="relative z-10">
					<h2 className="mb-1 text-lg font-semibold">Ready to workout?</h2>
					<p className="mb-4 text-sm text-white/80">Start your training session now</p>
					<Button className="bg-white font-semibold text-orange-600 hover:bg-white/90">
						<Play className="mr-2 h-4 w-4" />
						Start Workout
					</Button>
				</div>
				<div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-white/10" />
				<div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10" />
			</motion.div>
		</div>
	);
}
