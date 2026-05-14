"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { NetworkSync } from "@/components/network-sync";
import { TimezoneProvider } from "@/components/timezone-sync";
import {
	ActiveWorkoutHomeProvider,
	useActiveWorkoutHome,
} from "@/hooks/workout/active-workout-home";
import { authClient, bootstrapMobileAuthBeforeSession } from "@/lib/auth-client";
import { ROUTES } from "@/lib/consts";
import { cn } from "@/lib/utils";

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
	const router = useRouter();
	const { isActiveWorkoutVisible } = useActiveWorkoutHome();
	const { data: session, isPending, refetch } = authClient.useSession();
	const [authBootstrapReady, setAuthBootstrapReady] = useState(false);
	const refetchSessionRef = useRef(refetch);

	useEffect(() => {
		refetchSessionRef.current = refetch;
	});

	useEffect(() => {
		let cancelled = false;

		void bootstrapMobileAuthBeforeSession(() => refetchSessionRef.current()).finally(() => {
			if (!cancelled) setAuthBootstrapReady(true);
		});

		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		if (!authBootstrapReady) return;
		if (isPending) return;
		if (session) return;
		router.replace(ROUTES.LOGIN);
	}, [authBootstrapReady, isPending, router, session]);

	const sessionLoading = !authBootstrapReady || isPending;

	if (!session) {
		return (
			<AppLayout className={cn({ "px-5 pt-12": !isActiveWorkoutVisible })}>
				<TimezoneProvider />
				<div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">
					{sessionLoading ? "Loading session..." : "Redirecting to login..."}
				</div>
			</AppLayout>
		);
	}

	return (
		<AppLayout className={cn({ "px-5 pt-12": !isActiveWorkoutVisible })}>
			<TimezoneProvider />
			<NetworkSync />
			{children}
		</AppLayout>
	);
}
