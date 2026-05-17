"use client";

import { ReactNode } from "react";

import { useMobileAuthBootstrap } from "@/hooks/use-mobile-auth-bootstrap";

type AuthPublicShellProps = {
	children: ReactNode;
};

export function AuthPublicShell({ children }: AuthPublicShellProps) {
	const { sessionLoading, isAuthenticated } = useMobileAuthBootstrap();

	if (sessionLoading) {
		return (
			<div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
				<p className="text-muted-foreground text-sm">Loading session...</p>
			</div>
		);
	}

	if (isAuthenticated) {
		return (
			<div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
				<p className="text-muted-foreground text-sm">Redirecting...</p>
			</div>
		);
	}

	return children;
}
