import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins";

// If your Prisma file is located elsewhere, you can change the path
import {
	applyMobileDevUrlEnv,
	resolveBetterAuthTrustedOriginsRaw,
	resolveBetterAuthUrl,
} from "@/lib/env/mobile-dev-url";
import { prisma } from "@/lib/prisma";

applyMobileDevUrlEnv();

const trustedOriginsFromEnv = resolveBetterAuthTrustedOriginsRaw()
	.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean);

function trustedOriginFromBetterAuthUrl(): string | null {
	const raw = resolveBetterAuthUrl();
	if (!raw) return null;
	try {
		return new URL(raw).origin;
	} catch {
		return null;
	}
}

/** Capacitor / Ionic WebView `Origin` values (Better Auth CSRF allowlist). */
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
		...(betterAuthPublicOrigin ? [betterAuthPublicOrigin] : []),
	]),
];

export const auth = betterAuth({
	baseURL: resolveBetterAuthUrl(),
	/** if no database is provided, the user data will be stored in memory.
	 * Make sure to provide a database to persist user data **/
	logger: {
		level: "debug", // Options: "info", "warn", "error", "debug"
	},
	// Better Auth validates Origin against this allowlist for CSRF protection.
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
			maxAge: 5 * 60, // Cache duration in seconds (5 minutes)
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
