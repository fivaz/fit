"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { TimezoneProvider } from "@/components/timezone-sync";
import { ROUTES } from "@/lib/consts";
import { cn } from "@/lib/utils";

type DashboardLayoutType = {
	children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutType) {
	const pathname = usePathname();

	const isWorkoutPage = pathname?.startsWith(ROUTES.WORKOUT);

	return (
		<AppLayout className={cn({ "px-5 pt-12": !isWorkoutPage })}>
			<TimezoneProvider />
			{children}
		</AppLayout>
	);
}
