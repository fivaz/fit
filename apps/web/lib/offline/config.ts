/** When false: no localStorage cache, no mutation queue, no offline fallbacks — API errors surface to the UI. */
export function isOfflineEnabled(): boolean {
	return process.env.NEXT_PUBLIC_OFFLINE_ENABLED !== "false";
}
