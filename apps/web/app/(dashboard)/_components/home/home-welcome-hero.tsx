"use client";

import { useMemo } from "react";

import { motion } from "framer-motion";

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
		</div>
	);
}
