"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { forgetLastSession, readLastSession, rememberLastSession } from "@/lib/auth/last-session";
import { resolveSessionStatus } from "@/lib/auth/session-status";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/consts";
import { clearMobileAuthToken } from "@/lib/mobile/auth-token-store";
import { runSessionBootstrap } from "@/lib/mobile/session-bootstrap";
import { SESSION_GATE_TIMEOUT_MS } from "@/lib/mobile/session-gate";
import { reportStartupMilestone } from "@/lib/telemetry/startup-timing";

// The stored hint only matters before the first answer, so there's nothing to subscribe to.
function subscribeToNothing() {
	return () => {};
}

function hasLastSession() {
	return readLastSession() !== null;
}

/**
 * Decides whether the dashboard can render. A device that was signed in before opens straight away
 * while the session is re-checked in the background, so an API cold start doesn't block the app.
 * The user is sent to login only when the server actually answers that there is no session.
 */
export function useDashboardSessionGate() {
	const router = useRouter();
	const { data: session, isPending, isRefetching, error, refetch } = authClient.useSession();
	const [bootstrapReady, setBootstrapReady] = useState(false);
	const [isSlow, setIsSlow] = useState(false);
	// The static export pre-renders without storage, so hydrate with `false` and read it right after.
	const hadSession = useSyncExternalStore(subscribeToNothing, hasLastSession, () => false);
	const refetchRef = useRef(refetch);

	useEffect(() => {
		refetchRef.current = refetch;
	});

	useEffect(() => {
		let cancelled = false;
		void runSessionBootstrap(() => refetchRef.current()).then(() => {
			if (!cancelled) setBootstrapReady(true);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	const status = resolveSessionStatus({
		hasSession: Boolean(session),
		isPending,
		isRefetching,
		errorStatus: error ? (error.status ?? 0) : null,
		bootstrapReady,
	});

	useEffect(() => {
		if (status !== "unknown") return;
		const id = window.setTimeout(() => setIsSlow(true), SESSION_GATE_TIMEOUT_MS);
		return () => window.clearTimeout(id);
	}, [status]);

	const userId = session?.user.id;
	useEffect(() => {
		if (userId) rememberLastSession(userId);
	}, [userId]);

	useEffect(() => {
		if (status !== "signed-out") return;
		forgetLastSession();
		void clearMobileAuthToken().finally(() => {
			router.replace(ROUTES.LOGIN);
		});
	}, [router, status]);

	const canRender = status === "signed-in" || (status === "unknown" && hadSession);

	useEffect(() => {
		if (!canRender) return;
		reportStartupMilestone("app.dashboard_shown", {
			// "unknown" means the app opened on the remembered session, before the API answered.
			"session.status": status,
			"session.remembered": hadSession,
		});
	}, [canRender, hadSession, status]);

	useEffect(() => {
		if (status === "unknown") return;
		reportStartupMilestone("app.session_resolved", { "session.status": status });
	}, [status]);

	const retry = useCallback(() => {
		setIsSlow(false);
		void refetchRef.current();
	}, []);

	return {
		/** Render the app: signed in, or signed in before and still waiting on the server. */
		canRender,
		status,
		/** The session check has been waiting a while (e.g. the API container is still booting). */
		isSlow: status === "unknown" && isSlow,
		retry,
	};
}
