"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/consts";
import { clearMobileAuthToken } from "@/lib/mobile/auth-token-store";
import { canTrustAuthenticatedRedirect, runSessionBootstrap } from "@/lib/mobile/session-bootstrap";
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
	const [bootstrapRefetchOk, setBootstrapRefetchOk] = useState(false);
	const [gateTimedOut, setGateTimedOut] = useState(false);
	const refetchSessionRef = useRef(refetch);

	useEffect(() => {
		refetchSessionRef.current = refetch;
	});

	useEffect(() => {
		let cancelled = false;

		void runSessionBootstrap(() => refetchSessionRef.current()).then((ok) => {
			if (cancelled) return;
			setBootstrapRefetchOk(ok);
			setBootstrapReady(true);
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
		if (!bootstrapReady || !redirectIfAuthenticated) return;

		if (canTrustAuthenticatedRedirect(session, bootstrapRefetchOk)) {
			router.replace(ROUTES.HOME);
			return;
		}

		// Stale React Query session after a failed refetch — drop it so login does not loop.
		if (bootstrapRefetchOk || !session) return;

		void clearMobileAuthToken().then(() => refetchSessionRef.current());
	}, [bootstrapReady, bootstrapRefetchOk, redirectIfAuthenticated, router, session]);

	const sessionLoading = !bootstrapReady || (isPending && !gateTimedOut);
	const isAuthenticated = canTrustAuthenticatedRedirect(session, bootstrapRefetchOk);

	return {
		bootstrapReady,
		bootstrapRefetchOk,
		session,
		sessionLoading,
		isAuthenticated,
	};
}
