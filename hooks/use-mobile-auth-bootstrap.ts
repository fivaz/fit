"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { authClient, bootstrapMobileAuthBeforeSession } from "@/lib/auth-client";
import { ROUTES } from "@/lib/consts";
import { SESSION_GATE_TIMEOUT_MS } from "@/lib/mobile/session-gate";

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
	const [gateTimedOut, setGateTimedOut] = useState(false);
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
		if (!bootstrapReady) return;
		const id = window.setTimeout(() => setGateTimedOut(true), SESSION_GATE_TIMEOUT_MS);
		return () => window.clearTimeout(id);
	}, [bootstrapReady]);

	useEffect(() => {
		if (!bootstrapReady) return;
		if (isPending && !gateTimedOut) return;
		if (!session || !redirectIfAuthenticated) return;
		router.replace(ROUTES.HOME);
	}, [bootstrapReady, gateTimedOut, isPending, redirectIfAuthenticated, router, session]);

	const sessionLoading = !bootstrapReady || (isPending && !gateTimedOut);

	return {
		bootstrapReady,
		session,
		sessionLoading,
		isAuthenticated: Boolean(session),
	};
}
