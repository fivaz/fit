"use client";

import { ReactNode } from "react";

import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { useMobileAuthBootstrap } from "@/hooks/use-mobile-auth-bootstrap";

type AuthPublicShellProps = {
	children: ReactNode;
};

export function AuthPublicShell({ children }: AuthPublicShellProps) {
	const { sessionLoading, isAuthenticated } = useMobileAuthBootstrap();

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
