import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins";

import { prisma } from "@/prisma/client";

const trustedOriginsFromEnv = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
	.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean);

function trustedOriginFromBetterAuthUrl(): string | null {
	const raw = process.env.BETTER_AUTH_URL?.trim();
	if (!raw) return null;
	try {
		return new URL(raw).origin;
	} catch {
		return null;
	}
}

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

const betterAuthPublicOrigin = trustedOriginFromBetterAuthUrl();
const trustedOrigins = [
	...new Set([
		...trustedOriginsBase,
		...MOBILE_WEBVIEW_ORIGINS,
		"http://localhost:3000",
		...(betterAuthPublicOrigin ? [betterAuthPublicOrigin] : []),
	]),
];

export const auth = betterAuth({
baseURL: process.env.BETTER_AUTH_URL?.trim() || "http://localhost:3001",
	logger: {
		level: "debug",
	},
	trustedOrigins,
	database: prismaAdapter(prisma, { provider: "postgresql" }),
	user: {
		additionalFields: {
			timezone: {
				type: "string",
				required: false,
			},
		},
	},
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
	plugins: [bearer()],
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		},
		github: {
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
		},
	},
});
