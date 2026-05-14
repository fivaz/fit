import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import type { auth } from "@/lib/auth";
import {
	clearMobileAuthToken,
	getMobileAuthTokenSync,
	hydrateMobileAuthToken,
	persistMobileAuthToken,
} from "@/lib/mobile/auth-token-store";

export const authClient = createAuthClient({
	plugins: [inferAdditionalFields<typeof auth>()],
	baseURL: process.env.NEXT_PUBLIC_AUTH_BASE_URL || undefined,
	fetchOptions: {
		auth: {
			type: "Bearer",
			token: () => getMobileAuthTokenSync() ?? "",
		},
		onSuccess: async (ctx) => {
			const token = ctx.response.headers.get("set-auth-token");
			if (!token) return;
			await persistMobileAuthToken(token);
		},
	},
});

if (typeof window !== "undefined") {
	void hydrateMobileAuthToken();
}

export const { signIn, signUp, useSession } = authClient;

/** Load persisted bearer token, then refresh Better Auth session (needed after Capacitor full page loads). */
export async function bootstrapMobileAuthBeforeSession(
	refetchSession: () => Promise<void>,
): Promise<void> {
	await hydrateMobileAuthToken();
	await refetchSession();
}

type SignOutOptions = Parameters<typeof authClient.signOut>[0];

export async function signOut(options?: SignOutOptions) {
	const result = await authClient.signOut(options);
	await clearMobileAuthToken();
	return result;
}
