"use client";

import { authClient, signIn, signUp } from "@/lib/auth-client";
import { ROUTES } from "@/lib/consts";
import {
	consumeAuthTokenRememberMe,
	persistMobileAuthToken,
	setAuthTokenRememberMe,
} from "@/lib/mobile/auth-token-store";
import {
	isNativeGoogleConfigured,
	requestNativeSocialCredential,
} from "@/lib/mobile/native-social-login";
import { isNativeMobileRuntime } from "@/lib/mobile/runtime";

export type MobileAuthHandlers = {
	onResponse?: () => void;
	onError?: (message: string) => void;
	onSuccess?: () => void;
};

function mobileAuthFetchOptions(handlers?: MobileAuthHandlers) {
	return {
		onResponse: handlers?.onResponse,
		onError: (ctx: { error: { message: string } }) => {
			handlers?.onError?.(ctx.error.message);
		},
		// better-fetch merges client-level and per-call fetchOptions with a shallow spread, so
		// passing an onSuccess here replaces (not composes with) auth-client.ts's client-level
		// onSuccess — which is what persists the bearer token. Persist it here too, or mobile
		// sign-in/sign-up silently never stores a token and every following request 401s.
		onSuccess: async (ctx: { response: Response }) => {
			const token = ctx.response.headers.get("set-auth-token");
			if (token) {
				await persistMobileAuthToken(token, consumeAuthTokenRememberMe());
			}
			handlers?.onSuccess?.();
		},
	};
}

export async function signInWithEmailForMobile(params: {
	email: string;
	password: string;
	rememberMe?: boolean;
	handlers?: MobileAuthHandlers;
}) {
	const { email, password, rememberMe = true, handlers } = params;

	setAuthTokenRememberMe(rememberMe);

	return signIn.email({
		email,
		password,
		rememberMe,
		callbackURL: ROUTES.HOME,
		fetchOptions: mobileAuthFetchOptions(handlers),
	});
}

export async function signUpWithEmailForMobile(params: {
	email: string;
	password: string;
	name: string;
	timezone?: string;
	image?: string;
	handlers?: MobileAuthHandlers;
}) {
	const { email, password, name, timezone, image, handlers } = params;

	return signUp.email({
		email,
		password,
		name,
		timezone: timezone ?? "UTC",
		image,
		callbackURL: ROUTES.HOME,
		fetchOptions: mobileAuthFetchOptions(handlers),
	});
}

export type SocialProvider = "apple" | "google";

/** Providers the current runtime can sign in with (native Google also needs its iOS client ID). */
export function getAvailableSocialProviders(): SocialProvider[] {
	if (isNativeMobileRuntime() && !isNativeGoogleConfigured()) return ["apple"];
	return ["apple", "google"];
}

/**
 * Native: the OS sheet returns an ID token that Better Auth verifies directly, so no browser redirect
 * (unreliable in WKWebView) is involved. Web: standard OAuth redirect back to this SPA.
 * Resolves `true` when a native sign-in completed; on web the page navigates away instead.
 */
export async function signInWithSocialForMobile(params: {
	provider: SocialProvider;
	handlers?: MobileAuthHandlers;
}): Promise<boolean> {
	const { provider, handlers } = params;
	setAuthTokenRememberMe(true);

	if (isNativeMobileRuntime()) {
		const { idToken, displayName } = await requestNativeSocialCredential(provider);
		const result = await signIn.social({
			provider,
			idToken: { token: idToken },
			callbackURL: ROUTES.HOME,
			fetchOptions: mobileAuthFetchOptions(handlers),
		});
		if (result.error) return false;

		// Apple's ID token carries no name, so Better Auth would fall back to the email as the display name.
		if (provider === "apple" && displayName) {
			await authClient.updateUser({ name: displayName });
		}
		return true;
	}

	// The API lives on another origin, so a relative callback would land on the API instead of this app.
	await signIn.social({
		provider,
		callbackURL: `${window.location.origin}${ROUTES.AUTH_CALLBACK}`,
		errorCallbackURL: `${window.location.origin}${ROUTES.LOGIN}`,
		fetchOptions: { onError: (ctx) => handlers?.onError?.(ctx.error.message) },
	});
	return false;
}
