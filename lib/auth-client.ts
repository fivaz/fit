import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import type { auth } from "@/lib/auth";
import { resolvePublicAuthBaseUrl } from "@/lib/env/mobile-dev-url";
import {
	clearMobileAuthToken,
	consumeAuthTokenRememberMe,
	getMobileAuthTokenSync,
	hydrateMobileAuthToken,
	persistMobileAuthToken,
} from "@/lib/mobile/auth-token-store";
import { clientDebug } from "@/lib/mobile/client-debug";

const SESSION_REFETCH_TIMEOUT_MS = 10_000;

function isLoopbackHost(hostname: string) {
	return hostname === "localhost" || hostname === "127.0.0.1";
}

function resolveAuthBaseURL() {
	const configuredBaseURL = resolvePublicAuthBaseUrl();
	if (!configuredBaseURL) return undefined;
	if (typeof window === "undefined") return configuredBaseURL;

	const currentURL = new URL(window.location.origin);
	const configuredURL = new URL(configuredBaseURL);
	const isSameOrigin = currentURL.origin === configuredURL.origin;
	const isEquivalentLoopback =
		currentURL.protocol === configuredURL.protocol &&
		currentURL.port === configuredURL.port &&
		isLoopbackHost(currentURL.hostname) &&
		isLoopbackHost(configuredURL.hostname);

	return isSameOrigin || isEquivalentLoopback ? undefined : configuredBaseURL;
}

export const authClient = createAuthClient({
	plugins: [inferAdditionalFields<typeof auth>()],
	baseURL: resolveAuthBaseURL(),
	fetchOptions: {
		auth: {
			type: "Bearer",
			token: () => getMobileAuthTokenSync() ?? "",
		},
		onSuccess: async (ctx) => {
			const token = ctx.response.headers.get("set-auth-token");
			if (!token) return;
			await persistMobileAuthToken(token, consumeAuthTokenRememberMe());
		},
	},
});

if (typeof window !== "undefined") {
	void hydrateMobileAuthToken();
}

export const { signIn, signUp, useSession } = authClient;

/** Load persisted bearer token, then refresh Better Auth session (needed after Capacitor full page loads). */
export async function bootstrapMobileAuthBeforeSession(
	refetchSession: () => Promise<unknown>,
): Promise<boolean> {
	await hydrateMobileAuthToken();

	try {
		await Promise.race([
			Promise.resolve(refetchSession()),
			new Promise<never>((_, reject) => {
				setTimeout(() => reject(new Error("Session refetch timeout")), SESSION_REFETCH_TIMEOUT_MS);
			}),
		]);
		return true;
	} catch (error) {
		clientDebug("auth", "bootstrap refetch failed", {
			error: error instanceof Error ? error.message : String(error),
			hasBearerToken: Boolean(getMobileAuthTokenSync()),
			authBaseURL: resolveAuthBaseURL() ?? "(same origin)",
		});
		return false;
	}
}

type SignOutOptions = Parameters<typeof authClient.signOut>[0];

export async function signOut(options?: SignOutOptions) {
	const result = await authClient.signOut(options);
	await clearMobileAuthToken();
	return result;
}
