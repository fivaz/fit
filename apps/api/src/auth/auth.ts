import { betterAuth, type BetterAuthOptions } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, oneTimeToken } from "better-auth/plugins";

import { resolveApiPublicOrigin, resolveApiPublicUrl } from "@/api-origin";
import { createAppleClientSecret } from "@/auth/apple-client-secret";
import { mobileDevOriginFromEnv } from "@/dev-origins";
import { prisma } from "@/prisma/client";

const trustedOriginsFromEnv = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
	.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean);

const MOBILE_WEBVIEW_ORIGINS = [
	"capacitor://localhost",
	"ionic://localhost",
	"http://localhost",
] as const;

const trustedOriginsBase =
	trustedOriginsFromEnv.length > 0
		? trustedOriginsFromEnv
		: process.env.NODE_ENV === "production"
			? []
			: ["http://localhost:3000"];

const betterAuthPublicOrigin = resolveApiPublicOrigin();
const mobileDevOrigin = mobileDevOriginFromEnv();

// Apple's web flow returns to the callback with a cross-site `form_post`, so its origin must be trusted.
const APPLE_ORIGIN = "https://appleid.apple.com";

const trustedOrigins = [
	...new Set([
		...trustedOriginsBase,
		...MOBILE_WEBVIEW_ORIGINS,
		APPLE_ORIGIN,
		"http://localhost:3000",
		...(betterAuthPublicOrigin ? [betterAuthPublicOrigin] : []),
		...(mobileDevOrigin ? [mobileDevOrigin] : []),
	]),
];

/**
 * Providers are only registered when their credentials are present, so a missing
 * secret disables that button's backend instead of crashing on `undefined!`.
 */
function buildSocialProviders(): BetterAuthOptions["socialProviders"] {
	const providers: NonNullable<BetterAuthOptions["socialProviders"]> = {};

	const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
	if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
		providers.google = { clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET };
	}

	const { APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY, APPLE_APP_BUNDLE_ID } =
		process.env;
	if (APPLE_CLIENT_ID && APPLE_TEAM_ID && APPLE_KEY_ID && APPLE_PRIVATE_KEY) {
		providers.apple = {
			clientId: APPLE_CLIENT_ID,
			clientSecret: createAppleClientSecret({
				teamId: APPLE_TEAM_ID,
				keyId: APPLE_KEY_ID,
				clientId: APPLE_CLIENT_ID,
				privateKey: APPLE_PRIVATE_KEY,
			}),
			// The web flow's ID tokens carry the Services ID as `aud`; the native iOS sheet's carry the bundle ID.
			appBundleIdentifier: APPLE_APP_BUNDLE_ID,
			audience: APPLE_APP_BUNDLE_ID ? [APPLE_CLIENT_ID, APPLE_APP_BUNDLE_ID] : undefined,
		};
	}

	return providers;
}

export const auth = betterAuth({
	baseURL: resolveApiPublicUrl(),
	logger: {
		level: "debug",
	},
	trustedOrigins,
	database: prismaAdapter(prisma, { provider: "postgresql" }),
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
		},
	},
	emailAndPassword: {
		enabled: true,
		async sendResetPassword(_data, _request) {
			// Send an email to the user with a link to reset their password
		},
	},
	user: {
		additionalFields: {
			timezone: {
				type: "string",
				required: false,
			},
		},
		deleteUser: {
			enabled: true,
		},
	},
	// oneTimeToken lets the SPA trade the cookie session left by a web OAuth redirect for a bearer token.
	plugins: [bearer(), oneTimeToken()],
	socialProviders: buildSocialProviders(),
});
