/**
 * Remembers that this device was signed in, so the app can open straight away while the session is
 * re-checked in the background (a scaled-to-zero API can take many seconds to answer). Only the user
 * id is kept: no token or personal data. It is a UI hint, not authorization; the API still checks
 * the session on every request.
 */
const LAST_SESSION_KEY = "fit:last-session:v1";

type LastSession = { readonly userId: string };

function isLastSession(value: unknown): value is LastSession {
	return (
		typeof value === "object" &&
		value !== null &&
		typeof (value as { userId?: unknown }).userId === "string"
	);
}

export function readLastSession(): LastSession | null {
	if (typeof window === "undefined") return null;
	try {
		const parsed: unknown = JSON.parse(window.localStorage.getItem(LAST_SESSION_KEY) ?? "null");
		return isLastSession(parsed) ? parsed : null;
	} catch {
		return null;
	}
}

export function rememberLastSession(userId: string): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(LAST_SESSION_KEY, JSON.stringify({ userId }));
	} catch {
		// Storage can be full or blocked; the app then just waits for the session check as before.
	}
}

export function forgetLastSession(): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.removeItem(LAST_SESSION_KEY);
	} catch {
		// Nothing to forget if storage is unavailable.
	}
}
