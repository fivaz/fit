/**
 * Client API/auth origins. After the frontend/backend split these must not
 * fall back to MOBILE_DEV_URL (that URL is the Capacitor webview / Next origin).
 */

export const MOBILE_DEV_URL_ENV = "MOBILE_DEV_URL";

const DEFAULT_LOCAL_API_ORIGIN = "http://localhost:3001";

export function readMobileDevUrl(): string | undefined {
	const value = process.env[MOBILE_DEV_URL_ENV]?.trim();
	return value || undefined;
}

function defaultApiOrigin(): string | undefined {
	if (process.env.NODE_ENV === "production") return undefined;
	return DEFAULT_LOCAL_API_ORIGIN;
}

export function resolveCapacitorServerUrl(): string | undefined {
	const specific = process.env.CAPACITOR_SERVER_URL?.trim();
	if (specific) return specific;
	return readMobileDevUrl();
}

export function resolvePublicApiBaseUrl(): string | undefined {
	return process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || defaultApiOrigin();
}

export function resolvePublicAuthBaseUrl(): string | undefined {
	return process.env.NEXT_PUBLIC_AUTH_BASE_URL?.trim() || defaultApiOrigin();
}
