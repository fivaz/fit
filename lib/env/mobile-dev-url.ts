/**
 * Single dev/tunnel origin for Capacitor + Better Auth (see `.env.example` `MOBILE_DEV_URL`).
 * Specific env vars take precedence when set.
 */

export const MOBILE_DEV_URL_ENV = "MOBILE_DEV_URL";

export function readMobileDevUrl(): string | undefined {
	const value = process.env[MOBILE_DEV_URL_ENV]?.trim();
	return value || undefined;
}

/** Returns `specific` when set, otherwise `MOBILE_DEV_URL`. */
export function resolveEnvUrl(specific: string | undefined): string | undefined {
	const trimmed = specific?.trim();
	if (trimmed) return trimmed;
	return readMobileDevUrl();
}

export function resolveBetterAuthUrl(): string | undefined {
	return resolveEnvUrl(process.env.BETTER_AUTH_URL);
}

export function resolveCapacitorServerUrl(): string | undefined {
	return resolveEnvUrl(process.env.CAPACITOR_SERVER_URL);
}

export function resolvePublicApiBaseUrl(): string | undefined {
	return resolveEnvUrl(process.env.NEXT_PUBLIC_API_BASE_URL);
}

export function resolvePublicAuthBaseUrl(): string | undefined {
	return resolveEnvUrl(process.env.NEXT_PUBLIC_AUTH_BASE_URL);
}

/** Comma-separated list; falls back to `MOBILE_DEV_URL` when unset. */
export function resolveBetterAuthTrustedOriginsRaw(): string {
	const specific = process.env.BETTER_AUTH_TRUSTED_ORIGINS?.trim();
	if (specific) return specific;
	return readMobileDevUrl() ?? "";
}

/**
 * Copies `MOBILE_DEV_URL` into unset server env vars so Better Auth and other
 * runtime readers of `process.env.BETTER_AUTH_URL` stay aligned.
 */
export function applyMobileDevUrlEnv(): void {
	const fallback = readMobileDevUrl();
	if (!fallback) return;

	const serverKeys = ["BETTER_AUTH_URL", "BETTER_AUTH_TRUSTED_ORIGINS"] as const;
	for (const key of serverKeys) {
		if (!process.env[key]?.trim()) {
			process.env[key] = fallback;
		}
	}
}
