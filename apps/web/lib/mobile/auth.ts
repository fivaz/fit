"use client";

import { signIn, signUp } from "@/lib/auth-client";
import { ROUTES } from "@/lib/consts";
import { setAuthTokenRememberMe } from "@/lib/mobile/auth-token-store";

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
		onSuccess: handlers?.onSuccess,
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
