import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
	plugins: [inferAdditionalFields<typeof auth>()],
	// if using a foreign domain for the server, uncomment the line below and set the env variable
	// baseURL: process.env.NEXT_PUBLIC_APP_URL,
});
export const { signIn, signOut, signUp, useSession } = authClient;
