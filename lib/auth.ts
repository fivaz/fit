import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// If your Prisma file is located elsewhere, you can change the path
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
	/** if no database is provided, the user data will be stored in memory.
	 * Make sure to provide a database to persist user data **/
	logger: {
		level: "debug", // Options: "info", "warn", "error", "debug"
	},
	// Playwright `playwright.config.ts` uses http://localhost:3001; Better Auth validates Origin.
	trustedOrigins: ["http://localhost:3001"],
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
