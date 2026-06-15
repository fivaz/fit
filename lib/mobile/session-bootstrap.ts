"use client";

import { bootstrapMobileAuthBeforeSession } from "@/lib/auth-client";
import { resolvePublicAuthBaseUrl } from "@/lib/env/mobile-dev-url";
import { getMobileAuthTokenSync } from "@/lib/mobile/auth-token-store";

export async function runSessionBootstrap(
	refetchSession: () => Promise<unknown>,
): Promise<boolean> {
	return bootstrapMobileAuthBeforeSession(() => refetchSession());
}

/** Whether a restored client session is trustworthy enough to leave public auth routes. */
export function canTrustAuthenticatedRedirect(session: unknown, bootstrapRefetchOk: boolean) {
	if (!session || !bootstrapRefetchOk) return false;

	const authBaseURL = resolvePublicAuthBaseUrl();
	if (!authBaseURL) return true;

	if (typeof window === "undefined") return true;

	const currentURL = new URL(window.location.origin);
	const configuredURL = new URL(authBaseURL);
	if (currentURL.origin === configuredURL.origin) return true;

	return Boolean(getMobileAuthTokenSync());
}
