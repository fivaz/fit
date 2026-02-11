"use client";

import { useEffect } from "react";

import { authClient } from "@/lib/auth-client";
import { updateTimezoneAction } from "@/lib/user/actions";

export function TimezoneProvider() {
	// This fetch happens in the background after the page loads
	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		if (isPending || !session?.user) return;

		const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		const storedTimezone = session.user.timezone;

		if (browserTimezone !== storedTimezone) {
			void updateTimezoneAction(browserTimezone);
		}
	}, [session, isPending]);

	return null;
}
