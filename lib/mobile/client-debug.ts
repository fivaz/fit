/**
 * Optional verbose client logging for Capacitor / Safari debugging.
 *
 * Enable either:
 * - `NEXT_PUBLIC_CLIENT_DEBUG=1` (or `true`) in `.env.local`, then rebuild the static bundle if needed, or
 * - In Safari Web Inspector console: `localStorage.setItem("fit:client-debug","1")` then reload the WebView.
 *
 * Missing `*.js.map` lines in the console are usually the devtools/source-map fetch failing; they are unrelated
 * to API or auth failures unless you need stack traces from minified code.
 */

function truthyEnv(raw: string | undefined): boolean {
	const v = raw?.trim().toLowerCase();
	return v === "1" || v === "true" || v === "yes";
}

export function isClientDebugEnabled(): boolean {
	if (typeof window === "undefined") return false;
	if (truthyEnv(process.env.NEXT_PUBLIC_CLIENT_DEBUG)) return true;
	try {
		return window.localStorage.getItem("fit:client-debug") === "1";
	} catch {
		return false;
	}
}

export function clientDebug(scope: string, message: string, data?: Record<string, unknown>): void {
	if (!isClientDebugEnabled()) return;
	const payload = { scope, message, ...data, at: new Date().toISOString() };
	console.info(`[FitClient:${scope}]`, message, payload);
}
