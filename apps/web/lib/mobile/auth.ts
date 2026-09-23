"use client";

import { signIn, signUp } from "@/lib/auth-client";
import { ROUTES } from "@/lib/consts";
import {
	consumeAuthTokenRememberMe,
	persistMobileAuthToken,
	setAuthTokenRememberMe,
} from "@/lib/mobile/auth-token-store";

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
