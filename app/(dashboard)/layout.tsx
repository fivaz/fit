"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { NetworkSync } from "@/components/network-sync";
import { TimezoneProvider } from "@/components/timezone-sync";
import { useDashboardSessionGate } from "@/hooks/use-dashboard-session-gate";
import {
	ActiveWorkoutHomeProvider,
	useActiveWorkoutHome,
} from "@/hooks/workout/active-workout-home";
import { cn } from "@/lib/utils";
import { isWorkoutViewRoute } from "@/lib/workout/navigation";

type DashboardLayoutType = {
	children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutType) {
	return (
		<ActiveWorkoutHomeProvider>
			<DashboardLayoutContent>{children}</DashboardLayoutContent>
		</ActiveWorkoutHomeProvider>
	);
}

function DashboardLayoutContent({ children }: DashboardLayoutType) {
	const pathname = usePathname();
	const { isActiveWorkoutVisible } = useActiveWorkoutHome();
	const { session, sessionLoading, sessionUnreachable } = useDashboardSessionGate();

	const appLayoutClassName = cn(
		isActiveWorkoutVisible || isWorkoutViewRoute(pathname) ? undefined : "px-5 pt-12",
	);

	if (!session) {
		return (
			<AppLayout className={appLayoutClassName}>
				<TimezoneProvider />
				<div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 px-6 text-center text-sm text-gray-500">
					{sessionUnreachable ? (
						<>
							<p className="text-foreground font-medium">Can&apos;t reach the server</p>
							<p>
								Check that <code className="text-xs">pnpm dev</code> is running on your Mac, the
								hotspot IP in <code className="text-xs">.env</code> matches this Mac, and run{" "}
								<code className="text-xs">pnpm ios:build</code> after changing{" "}
								<code className="text-xs">NEXT_PUBLIC_*</code> URLs.
							</p>
						</>
					) : sessionLoading ? (
						"Loading session..."
					) : (
						"Redirecting to login..."
					)}
				</div>
			</AppLayout>
		);
	}

	return (
		<AppLayout className={appLayoutClassName}>
			<TimezoneProvider />
			<NetworkSync />
			{children}
		</AppLayout>
	);
}
