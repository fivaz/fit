"use client";

import { useEffect, useSyncExternalStore } from "react";

import { warmUpApi } from "@/lib/api-client";
import {
	type ApiStatus,
	getApiStatus,
	markApiUnreachable,
	subscribeToApiStatus,
} from "@/lib/api-status";
import { onNetworkAvailable } from "@/lib/mobile/network";
import { cn } from "@/lib/utils";

/** While the API is unreachable, check again this often so the dot recovers on its own. */
const RECHECK_UNREACHABLE_MS = 15_000;

const STATUS_DISPLAY: Record<ApiStatus, { label: string; className: string }> = {
	starting: {
		label: "Server starting, changes are saved on this device",
		className: "bg-yellow-400 animate-pulse",
	},
	online: { label: "Connected to the server", className: "bg-green-500" },
	unreachable: {
		label: "Can't reach the server, showing data saved on this device",
		className: "bg-red-500",
	},
};

// The static export pre-renders before any request, when the API's state isn't known yet.
function getPrerenderStatus(): ApiStatus {
	return "starting";
}

/**
 * A small dot in the corner showing whether the API is starting (yellow), connected (green) or
 * unreachable (red, the app is running on saved data).
 */
export function ApiStatusDot() {
	const status = useSyncExternalStore(subscribeToApiStatus, getApiStatus, getPrerenderStatus);

	useEffect(() => {
		window.addEventListener("offline", markApiUnreachable);
		const stopListening = onNetworkAvailable(warmUpApi);
		return () => {
			window.removeEventListener("offline", markApiUnreachable);
			stopListening();
		};
	}, []);

	useEffect(() => {
		if (status !== "unreachable") return;
		const id = window.setInterval(warmUpApi, RECHECK_UNREACHABLE_MS);
		return () => window.clearInterval(id);
	}, [status]);

	const { label, className } = STATUS_DISPLAY[status];

	return (
		<span
			role="status"
			aria-label={label}
			title={label}
			className={cn(
				// Top-left gutter of the app column (max-w-md = 28rem), just below the status bar.
				"fixed top-[calc(env(safe-area-inset-top)+0.5rem)] left-[max(0.5rem,calc(50%-14rem+0.5rem))] z-50 size-2 rounded-full opacity-70",
				className,
			)}
		/>
	);
}
