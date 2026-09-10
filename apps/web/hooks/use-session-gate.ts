"use client";

import { useEffect, useRef, useState } from "react";

import { authClient } from "@/lib/auth-client";
import { clearMobileAuthToken } from "@/lib/mobile/auth-token-store";
import { clientDebug } from "@/lib/mobile/client-debug";
import { runSessionBootstrap } from "@/lib/mobile/session-bootstrap";

/** Stop waiting on `useSession().isPending` so Capacitor users are not stuck forever on network hangs. */
export const SESSION_GATE_TIMEOUT_MS = 12_000;

type UseSessionGateResult = {
	session: ReturnType<typeof authClient.useSession>["data"];
	sessionLoading: boolean;
	sessionTimedOut: boolean;
	bootstrapReady: boolean;
};

export function useSessionGate(): UseSessionGateResult {
	const { data: session, isPending, refetch } = authClient.useSession();
	const [bootstrapReady, setBootstrapReady] = useState(false);
	const [sessionTimedOut, setSessionTimedOut] = useState(false);
	const refetchSessionRef = useRef(refetch);

	useEffect(() => {
		refetchSessionRef.current = refetch;
	});

	useEffect(() => {
		let cancelled = false;

		void runSessionBootstrap(() => refetchSessionRef.current()).finally(() => {
			if (!cancelled) setBootstrapReady(true);
		});

		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		if (!bootstrapReady) return;

		const id = window.setTimeout(() => {
			setSessionTimedOut(true);
			clientDebug("sessionGate", "timed out waiting for session", {
				isPending,
				hasSession: Boolean(session),
			});
		}, SESSION_GATE_TIMEOUT_MS);

		return () => window.clearTimeout(id);
	}, [bootstrapReady, isPending, session]);

	useEffect(() => {
		if (!sessionTimedOut || session) return;
		void clearMobileAuthToken();
	}, [session, sessionTimedOut]);

	const sessionLoading = !bootstrapReady || (isPending && !sessionTimedOut);

	return {
		session,
		sessionLoading,
		sessionTimedOut,
		bootstrapReady,
	};
}
