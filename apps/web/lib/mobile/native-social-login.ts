"use client";

import { SocialLogin } from "@capgo/capacitor-social-login";

export type NativeSocialProvider = "apple" | "google";

export type NativeSocialCredential = {
	idToken: string;
	/** Apple only shares the user's name on the very first authorization. */
	displayName?: string;
};

const GOOGLE_WEB_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID;

export function isNativeGoogleConfigured(): boolean {
	return Boolean(GOOGLE_WEB_CLIENT_ID && GOOGLE_IOS_CLIENT_ID);
}

let initialization: Promise<void> | null = null;

function initializeNativeSocialLogin(): Promise<void> {
	initialization ??= SocialLogin.initialize({
		apple: {},
		...(isNativeGoogleConfigured()
			? {
					google: {
						iOSClientId: GOOGLE_IOS_CLIENT_ID,
						// Makes Google issue ID tokens whose audience is the web client the API verifies against.
						iOSServerClientId: GOOGLE_WEB_CLIENT_ID,
						webClientId: GOOGLE_WEB_CLIENT_ID,
						mode: "online",
					},
				}
			: {}),
	}).catch((error: unknown) => {
		initialization = null;
		throw error;
	});
	return initialization;
}

/** Opens the system Apple / Google sheet and returns the ID token Better Auth verifies server-side. */
export async function requestNativeSocialCredential(
	provider: NativeSocialProvider,
): Promise<NativeSocialCredential> {
	await initializeNativeSocialLogin();

	if (provider === "apple") {
		const { result } = await SocialLogin.login({
			provider: "apple",
			options: { scopes: ["name", "email"] },
		});
		if (!result.idToken) throw new Error("Apple did not return an identity token.");

		const nameParts = [result.profile.givenName, result.profile.familyName].filter(Boolean);
		return {
			idToken: result.idToken,
			displayName: nameParts.length > 0 ? nameParts.join(" ") : undefined,
		};
	}

	const { result } = await SocialLogin.login({
		provider: "google",
		options: { scopes: ["email", "profile"] },
	});
	if (result.responseType !== "online" || !result.idToken) {
		throw new Error("Google did not return an identity token.");
	}
	return { idToken: result.idToken, displayName: result.profile.name ?? undefined };
}

/** True when the user dismissed the native sheet, which is not an error worth surfacing. */
export function isNativeSocialCancellation(error: unknown): boolean {
	const message = error instanceof Error ? error.message : String(error);
	// Match the cancel wording the Apple / Google sheets report when the user backs out.
	// Matches: "The user canceled the sign-in flow.", "user cancelled", "1001: canceled"
	// Does not match: "Network request failed"
	const cancellationRegex = /cancel/i;
	return cancellationRegex.test(message);
}
