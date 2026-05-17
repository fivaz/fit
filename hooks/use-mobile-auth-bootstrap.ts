"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { authClient, bootstrapMobileAuthBeforeSession } from "@/lib/auth-client";
import { ROUTES } from "@/lib/consts";

type UseMobileAuthBootstrapOptions = {
	/** When true, send users with a restored session to the home route. */
	redirectIfAuthenticated?: boolean;
};

/**
 * Hydrates the Capacitor bearer token and refetches Better Auth session before
 * rendering public auth screens (login/register).
 */
export function useMobileAuthBootstrap(options: UseMobileAuthBootstrapOptions = {}) {
	const { redirectIfAuthenticated = true } = options;
	const router = useRouter();
	const { data: session, isPending, refetch } = authClient.useSession();
	const [bootstrapReady, setBootstrapReady] = useState(false);
	const refetchSessionRef = useRef(refetch);

	useEffect(() => {
		refetchSessionRef.current = refetch;
	});

	useEffect(() => {
		let cancelled = false;

		void bootstrapMobileAuthBeforeSession(() => refetchSessionRef.current()).finally(() => {
			if (!cancelled) setBootstrapReady(true);
		});

		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		if (!bootstrapReady || isPending || !session || !redirectIfAuthenticated) return;
		router.replace(ROUTES.HOME);
	}, [bootstrapReady, isPending, redirectIfAuthenticated, router, session]);

	const sessionLoading = !bootstrapReady || isPending;

	return {
		bootstrapReady,
		session,
		sessionLoading,
		isAuthenticated: Boolean(session),
	};
}
