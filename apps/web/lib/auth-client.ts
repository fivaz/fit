import { AUTH_ADDITIONAL_FIELDS } from "@fit/shared";
import { inferAdditionalFields, oneTimeTokenClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { forgetLastSession } from "@/lib/auth/last-session";
import { resolvePublicAuthBaseUrl } from "@/lib/env/mobile-dev-url";
import {
	clearMobileAuthToken,
	consumeAuthTokenRememberMe,
	getMobileAuthTokenSync,
	hydrateMobileAuthToken,
	persistMobileAuthToken,
} from "@/lib/mobile/auth-token-store";
import { clientDebug } from "@/lib/mobile/client-debug";
import { isNativeMobileRuntime } from "@/lib/mobile/runtime";

const SESSION_REFETCH_TIMEOUT_MS = 10_000;

function resolveAuthBaseURL() {
	// Always use the Nest origin. Collapsing to `undefined` made Better Auth
	// fall back to `window.location.origin` (`:3000`), and Next no longer
	// serves `/api/auth`.
	return resolvePublicAuthBaseUrl();
}

export const authClient = createAuthClient({
	plugins: [inferAdditionalFields(AUTH_ADDITIONAL_FIELDS), oneTimeTokenClient()],
	baseURL: resolveAuthBaseURL(),
	basePath: "/api/auth",
	fetchOptions: {
		// Web social login (OAuth redirect) leaves only a cookie session on the API origin. Sending it
		// lets `/auth/callback` trade that session for the bearer token `apiFetch` authenticates with.
		// The native app authenticates with the stored bearer token alone.
		credentials: isNativeMobileRuntime() ? "omit" : "include",
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
			authBaseURL: resolveAuthBaseURL() ?? "(unset)",
		});
		return false;
	}
}

type SignOutOptions = Parameters<typeof authClient.signOut>[0];

export async function signOut(options?: SignOutOptions) {
	const result = await authClient.signOut(options);
	forgetLastSession();
	await clearMobileAuthToken();
	return result;
}

type DeleteAccountOptions = { password?: string };

/**
 * Permanently deletes the signed-in user and all owned data (cascades at the DB level).
 * Social-only users have no password, so they omit it and rely on a freshly signed-in session.
 */
export async function deleteAccount({ password }: DeleteAccountOptions = {}) {
	const result = await authClient.deleteUser(password ? { password } : {});
	if (!result.error) {
		forgetLastSession();
		await clearMobileAuthToken();
	}
	return result;
}

/** Whether the signed-in user can authenticate with a password (false for social-only accounts). */
export async function hasPasswordAccount(): Promise<boolean> {
	const { data } = await authClient.listAccounts();
	return (data ?? []).some((account) => account.providerId === "credential");
}
