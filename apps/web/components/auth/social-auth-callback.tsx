"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/consts";
import { logError } from "@/lib/logger";

/**
 * Landing page after a web OAuth redirect. The API left a cookie session, but the SPA calls the API
 * with a bearer token, so trade the cookie for one: the one-time token is verified, which re-issues
 * the session and makes the client store the `set-auth-token` it comes back with.
 */
export function SocialAuthCallback() {
	const router = useRouter();
	// One-time tokens are single use, so React strict mode's double effect must not run this twice.
	const hasStartedRef = useRef(false);

	useEffect(() => {
		if (hasStartedRef.current) return;
		hasStartedRef.current = true;

		const exchangeSessionForToken = async () => {
			const generated = await authClient.oneTimeToken.generate();
			if (generated.error || !generated.data?.token) {
				throw new Error(generated.error?.message ?? "No session found after sign-in.");
			}

			const verified = await authClient.oneTimeToken.verify({ token: generated.data.token });
			if (verified.error) throw new Error(verified.error.message ?? "Could not verify sign-in.");

			router.replace(ROUTES.HOME);
		};

		exchangeSessionForToken().catch((error: unknown) => {
			logError(error, "SocialAuthCallback#exchangeSessionForToken");
			toast.error("Sign-in failed. Please try again.");
			router.replace(ROUTES.LOGIN);
		});
	}, [router]);

	return <p className="text-muted-foreground text-center text-sm">Signing you in...</p>;
}
