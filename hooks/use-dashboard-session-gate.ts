"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { authClient, bootstrapMobileAuthBeforeSession } from "@/lib/auth-client";
import { ROUTES } from "@/lib/consts";
import { clearMobileAuthToken, getMobileAuthTokenSync } from "@/lib/mobile/auth-token-store";
import { clientDebug } from "@/lib/mobile/client-debug";
import { SESSION_GATE_TIMEOUT_MS } from "@/lib/mobile/session-gate";

export function useDashboardSessionGate() {
	const router = useRouter();
	const { data: session, isPending, refetch } = authClient.useSession();
	const [bootstrapReady, setBootstrapReady] = useState(false);
	const [gateTimedOut, setGateTimedOut] = useState(false);
	const refetchRef = useRef(refetch);

	useEffect(() => {
		refetchRef.current = refetch;
	});

	useEffect(() => {
		let cancelled = false;

		void bootstrapMobileAuthBeforeSession(() => refetchRef.current()).finally(() => {
			if (!cancelled) setBootstrapReady(true);
		});

		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		if (!bootstrapReady) return;

		const id = window.setTimeout(() => {
			setGateTimedOut(true);
			clientDebug("sessionGate", "timed out waiting for session", {
				isPending,
				hasSession: Boolean(session),
				hasBearerToken: Boolean(getMobileAuthTokenSync()),
			});
		}, SESSION_GATE_TIMEOUT_MS);

		return () => window.clearTimeout(id);
	}, [bootstrapReady, isPending, session]);

	useEffect(() => {
		if (!bootstrapReady) return;
		if (isPending && !gateTimedOut) return;
		if (session) return;

		void clearMobileAuthToken().finally(() => {
			router.replace(ROUTES.LOGIN);
		});
	}, [bootstrapReady, gateTimedOut, isPending, router, session]);

	const sessionLoading = !bootstrapReady || (isPending && !gateTimedOut);
	const sessionUnreachable =
		bootstrapReady && gateTimedOut && !session && Boolean(getMobileAuthTokenSync());

	return { session, sessionLoading, sessionUnreachable };
}
