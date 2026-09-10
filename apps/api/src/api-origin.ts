const DEFAULT_LOCAL_API_ORIGIN = "http://localhost:3001";

function trimEnv(name: string): string | undefined {
	const value = process.env[name]?.trim();
	return value || undefined;
}

/** Public Nest origin. `BETTER_AUTH_URL` overrides `API_BASE_URL`. */
export function resolveApiPublicUrl(): string {
	return trimEnv("BETTER_AUTH_URL") || trimEnv("API_BASE_URL") || DEFAULT_LOCAL_API_ORIGIN;
}

export function resolveApiPublicOrigin(): string | null {
	try {
		return new URL(resolveApiPublicUrl()).origin;
	} catch {
		return null;
	}
}
