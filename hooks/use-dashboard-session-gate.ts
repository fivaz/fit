"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/consts";
import { clearMobileAuthToken, getMobileAuthTokenSync } from "@/lib/mobile/auth-token-store";
import { clientDebug } from "@/lib/mobile/client-debug";
import { runSessionBootstrap } from "@/lib/mobile/session-bootstrap";
import { SESSION_GATE_TIMEOUT_MS } from "@/lib/mobile/session-gate";

export function useDashboardSessionGate() {
	const router = useRouter();
	const { data: session, isPending, refetch } = authClient.useSession();
	const [bootstrapReady, setBootstrapReady] = useState(false);
	const [bootstrapRefetchOk, setBootstrapRefetchOk] = useState(false);
	const [gateTimedOut, setGateTimedOut] = useState(false);
	const refetchRef = useRef(refetch);

	useEffect(() => {
		refetchRef.current = refetch;
	});

	useEffect(() => {
		let cancelled = false;

		void runSessionBootstrap(() => refetchRef.current()).then((ok) => {
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
		if (session) return;
		if (isPending && !gateTimedOut) return;

		const hasBearerToken = Boolean(getMobileAuthTokenSync());

		// Bearer present but session never loaded — likely API/tunnel unreachable; stay on dashboard UI.
		if (hasBearerToken && (!bootstrapRefetchOk || gateTimedOut)) return;

		void clearMobileAuthToken().finally(() => {
			router.replace(ROUTES.LOGIN);
		});
	}, [bootstrapReady, bootstrapRefetchOk, gateTimedOut, isPending, router, session]);

	const sessionLoading = !bootstrapReady || (isPending && !gateTimedOut);
	const sessionUnreachable =
		bootstrapReady &&
		!session &&
		Boolean(getMobileAuthTokenSync()) &&
		(!bootstrapRefetchOk || gateTimedOut);

	return { session, sessionLoading, sessionUnreachable };
}
