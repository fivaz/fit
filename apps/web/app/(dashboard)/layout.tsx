"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { NetworkSync } from "@/components/network-sync";
import { TimezoneProvider } from "@/components/timezone-sync";
import { Button } from "@/components/ui/button";
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
	const { canRender, status, isSlow, retry } = useDashboardSessionGate();

	const appLayoutClassName = cn(
		isActiveWorkoutVisible || isWorkoutViewRoute(pathname) ? undefined : "px-5 pt-12",
	);

	if (!canRender) {
		return (
			<AppLayout className={appLayoutClassName}>
				<TimezoneProvider />
				<div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6 text-center text-sm text-gray-500">
					{status === "signed-out" ? (
						"Redirecting to login..."
					) : isSlow ? (
						<>
							<p className="text-foreground font-medium">Waking up the server...</p>
							<p>This can take a few seconds after a quiet spell.</p>
							{process.env.NODE_ENV === "development" ? (
								<p>
									Still stuck? Check that <code className="text-xs">pnpm dev</code> is running and
									the API URL in <code className="text-xs">.env</code> is reachable from this
									device, then run <code className="text-xs">pnpm ios:build</code> after changing{" "}
									<code className="text-xs">NEXT_PUBLIC_*</code> URLs.
								</p>
							) : null}
							<Button type="button" variant="outline" size="sm" onClick={retry}>
								Retry
							</Button>
						</>
					) : (
						"Loading session..."
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
