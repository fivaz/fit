"use client";

import { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { NetworkSync } from "@/components/network-sync";
import { TimezoneProvider } from "@/components/timezone-sync";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/consts";
import { cn } from "@/lib/utils";

type DashboardLayoutType = {
	children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutType) {
	const router = useRouter();
	const pathname = usePathname();
	const { data: session, isPending } = authClient.useSession();

	const isWorkoutPage = pathname?.startsWith(ROUTES.WORKOUT);

	useEffect(() => {
		if (isPending) return;
		if (session) return;
		router.replace(ROUTES.LOGIN);
	}, [isPending, router, session]);

	if (!session) {
		return (
			<AppLayout className={cn({ "px-5 pt-12": !isWorkoutPage })}>
				<TimezoneProvider />
				<div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">
					{isPending ? "Loading session..." : "Redirecting to login..."}
				</div>
			</AppLayout>
		);
	}

	return (
		<AppLayout className={cn({ "px-5 pt-12": !isWorkoutPage })}>
			<TimezoneProvider />
			<NetworkSync />
			{children}
		</AppLayout>
	);
}
