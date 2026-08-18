import { mobileDevOriginFromEnv } from "@/dev-origins";

const MOBILE_SHELL_ORIGINS = new Set([
	"capacitor://localhost",
	"ionic://localhost",
	"http://localhost",
	"http://127.0.0.1",
]);

function extraOriginsFromEnv(): string[] {
	const raw = process.env.CORS_ALLOWED_ORIGINS ?? "";
	return raw
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
}

function betterAuthPublicOrigin(): string | null {
	const raw = process.env.BETTER_AUTH_URL?.trim();
	if (!raw) return null;
	try {
		return new URL(raw).origin;
	} catch {
		return null;
	}
}

export function isAllowedApiCorsOrigin(origin: string): boolean {
	const normalized = origin.trim();
	if (!normalized) return false;
	if (MOBILE_SHELL_ORIGINS.has(normalized)) return true;
	const appOrigin = betterAuthPublicOrigin();
	if (appOrigin && normalized === appOrigin) return true;
	const mobileDevOrigin = mobileDevOriginFromEnv();
	if (mobileDevOrigin && normalized === mobileDevOrigin) return true;
	if (extraOriginsFromEnv().includes(normalized)) return true;
	if (process.env.NODE_ENV !== "production") {
		if (/^https?:\/\/localhost(?::\d+)?$/.test(normalized)) return true;
		if (/^https?:\/\/127\.0\.0\.1(?::\d+)?$/.test(normalized)) return true;
	}
	return false;
}

export function corsOriginDelegate(
	origin: string | undefined,
	callback: (err: Error | null, allow?: boolean) => void,
): void {
	if (!origin) {
		callback(null, true);
		return;
	}
	callback(null, isAllowedApiCorsOrigin(origin));
}
