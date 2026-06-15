"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { motion } from "framer-motion";
import { Activity, ChevronRight, Dumbbell, LogOut, Palette, Scale, Zap } from "lucide-react";
import { toast } from "sonner";

import { MetricsForm } from "@/components/settings/metrics-form";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { UserForm } from "@/components/settings/user-form";
import { Button } from "@/components/ui/button";
import { BodyMetricsProvider, useBodyMetricsStore } from "@/hooks/body-metrics/store";
import { authClient, signOut } from "@/lib/auth-client";
import { BodyMetricsUI } from "@/lib/body-metrics/type";
import { ROUTES } from "@/lib/consts";
import { logError } from "@/lib/logger";
import { offlineDataAdapters } from "@/lib/offline/data-adapters";
import { cn } from "@/lib/utils";

type SettingsDetailProps = {
	bodyMetrics: BodyMetricsUI;
};

export function SettingsDetails({ bodyMetrics }: SettingsDetailProps) {
	useEffect(() => {
		offlineDataAdapters.setBodyMetricsLocal(bodyMetrics);
	}, [bodyMetrics]);

	return (
		<BodyMetricsProvider initialItems={[bodyMetrics]}>
			<SettingsDetailsInternal />
		</BodyMetricsProvider>
	);
}

export function SettingsDetailsInternal() {
	const [isPendingSignOut, setIsPendingSignOut] = useState(false);
	const { data: session } = authClient.useSession();

	const [isUserOpen, setIsUserOpen] = useState(false);
	const [isMetricsOpen, setIsMetricsOpen] = useState(false);
	const router = useRouter();
	const { firstItem: bodyMetrics } = useBodyMetricsStore();

	if (!bodyMetrics || !session) return null;

	const handleSignOut = async () => {
		setIsPendingSignOut(true);
		try {
			await signOut();
			router.push(ROUTES.LOGIN);
		} catch (error) {
			logError(error, "SettingsDetails#handleSignOut");
			toast.error("Failed to sign out. Please try again.");
		} finally {
			setIsPendingSignOut(false);
		}
	};

	const metricsDisplay = [
		{
			icon: Scale,
			label: "Weight",
			value: bodyMetrics.weight ? `${bodyMetrics.weight} kg` : "--",
		},
		{
			icon: Activity,
			label: "Body Fat",
			value: bodyMetrics.bodyFat ? `${bodyMetrics.bodyFat}%` : "--",
		},
		{
			icon: Dumbbell,
			label: "Muscle Mass",
			value: bodyMetrics.muscleMass ? `${bodyMetrics.muscleMass}%` : "--",
		},
		{
			icon: Zap,
			label: "Visceral Fat",
			value: bodyMetrics.visceralFat ? `Lvl ${bodyMetrics.visceralFat}` : "--",
		},
	];

	return (
		<>
			{/* Account Row */}
			<div className="mb-6">
				<motion.button
					onClick={() => setIsUserOpen(true)}
					className="flex w-full items-center gap-4 rounded-2xl bg-white p-5 text-left shadow-sm transition-transform active:scale-[0.98] dark:bg-gray-800"
				>
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-xl font-bold text-white shadow-inner">
						{session.user.name?.charAt(0) || "?"}
					</div>
					<div className="flex-1">
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
							{session.user.name}
						</h2>
						<p className="text-sm text-gray-500 dark:text-gray-400">{session.user.email}</p>
					</div>
					<ChevronRight className="h-5 w-5 text-gray-300" />
				</motion.button>
			</div>

			<div className="space-y-6 pb-8">
				{/* Body Composition Group */}
				<div>
					<h3 className="mb-2 text-sm font-semibold tracking-wider text-gray-500 uppercase">
						Body Stats
					</h3>
					<div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-gray-800">
						{metricsDisplay.map((item, idx) => (
							<div
								key={item.label}
								onClick={() => setIsMetricsOpen(true)}
								role="button"
								tabIndex={0}
								aria-label={`Edit ${item.label}`}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										setIsMetricsOpen(true);
									}
								}}
								className={cn(
									"flex cursor-pointer items-center justify-between p-4 transition-colors active:bg-gray-50 dark:active:bg-gray-700/50",
									idx < metricsDisplay.length - 1 && "border-b border-gray-50 dark:border-gray-700",
								)}
							>
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-900/20">
										<item.icon className="h-5 w-5 text-orange-500" />
									</div>
									<span className="font-medium dark:text-white">{item.label}</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-sm font-bold text-gray-900 dark:text-white">
										{item.value}
									</span>
									<ChevronRight className="h-4 w-4 text-gray-300" />
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Preferences Row */}
				<div>
					<h3 className="mb-2 text-sm font-semibold tracking-wider text-gray-500 uppercase">
						Preferences
					</h3>
					<div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-gray-800">
						<div className="flex items-center justify-between p-4">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700">
									<Palette className="h-5 w-5 text-gray-600 dark:text-gray-300" />
								</div>
								<span className="font-medium dark:text-white">Theme</span>
							</div>
							<ThemeToggle />
						</div>
					</div>
				</div>

				{/* Version & Logout */}
				<div className="pt-2 text-center">
					<Button
						onClick={handleSignOut}
						disabled={isPendingSignOut}
						variant="outline"
						className="mb-6 h-12 w-full rounded-xl border-red-100 text-red-500 hover:bg-red-50 dark:border-red-900/30"
					>
						<LogOut className="mr-2 h-5 w-5" /> Sign Out
					</Button>
					<div className="opacity-30">
						<span className="text-[10px] font-bold tracking-widest uppercase dark:text-white">
							Built with Passion
						</span>
						<p className="text-xs font-medium dark:text-white">
							Version {process.env.NEXT_PUBLIC_APP_VERSION}
							{process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_APP_GIT_HASH
								? ` - ${process.env.NEXT_PUBLIC_APP_GIT_HASH}`
								: null}
						</p>
					</div>
				</div>
			</div>

			<UserForm
				isOpen={isUserOpen}
				onClose={() => {
					toast.error("User update is not implemented yet.");
					setIsUserOpen(false);
				}}
				user={session.user}
			/>

			<MetricsForm
				isOpen={isMetricsOpen}
				onClose={() => setIsMetricsOpen(false)}
				bodyMetrics={bodyMetrics}
			/>
		</>
	);
}
