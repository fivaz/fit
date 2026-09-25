"use client";

import { ReactNode, useEffect } from "react";

import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { useMobileAuthBootstrap } from "@/hooks/use-mobile-auth-bootstrap";
import { stopStartupTiming } from "@/lib/telemetry/startup-timing";

type AuthPublicShellProps = {
	children: ReactNode;
};

export function AuthPublicShell({ children }: AuthPublicShellProps) {
	const { sessionLoading, isAuthenticated } = useMobileAuthBootstrap();
	const isShowingForm = !sessionLoading && !isAuthenticated;

	useEffect(() => {
		// Time spent signing in isn't app startup; don't let it inflate the startup milestones.
		if (isShowingForm) stopStartupTiming();
	}, [isShowingForm]);

	if (sessionLoading) {
		return (
			<AuthPageLayout>
				<p className="text-muted-foreground text-center text-sm">Loading session...</p>
			</AuthPageLayout>
		);
	}

	if (isAuthenticated) {
		return (
			<AuthPageLayout>
				<p className="text-muted-foreground text-center text-sm">Redirecting...</p>
			</AuthPageLayout>
		);
	}

	return children;
}
