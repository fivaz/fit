/**
 * CORS for Capacitor / browser clients calling `NEXT_PUBLIC_AUTH_BASE_URL` / API on another origin.
 * Used by `proxy.ts` for `/api/*`; `mergeCorsIntoResponse` is available for route handlers if needed.
 */

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
	if (extraOriginsFromEnv().includes(normalized)) return true;
	if (process.env.NODE_ENV !== "production") {
		if (/^https?:\/\/localhost(?::\d+)?$/.test(normalized)) return true;
		if (/^https?:\/\/127\.0\.0\.1(?::\d+)?$/.test(normalized)) return true;
	}
	return false;
}

export function corsHeadersFor(origin: string): Headers {
	const h = new Headers();
	h.set("Access-Control-Allow-Origin", origin.trim());
	h.set("Access-Control-Allow-Credentials", "true");
	h.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD");
	h.set(
		"Access-Control-Allow-Headers",
		"Content-Type, Authorization, Cookie, X-Requested-With, Accept, Origin, Cache-Control, Pragma",
	);
	h.set("Access-Control-Expose-Headers", "set-auth-token, Set-Auth-Token");
	h.set("Vary", "Origin");
	h.set("Access-Control-Max-Age", "86400");
	return h;
}

/** Merge CORS headers onto any Response (e.g. auth route if not covered by `proxy.ts`). */
export function mergeCorsIntoResponse(request: Request, response: Response): Response {
	const raw = request.headers.get("origin");
	const origin = raw?.trim();
	if (!origin || !isAllowedApiCorsOrigin(origin)) return response;

	const headers = new Headers(response.headers);
	corsHeadersFor(origin).forEach((value, key) => {
		headers.set(key, value);
	});

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}

/** OPTIONS preflight: return a `Response` for allowed origins, or 204 without CORS if disallowed. */
export function corsPreflightResponse(request: Request): Response | null {
	const raw = request.headers.get("origin");
	const origin = raw?.trim();
	if (request.method !== "OPTIONS") return null;
	if (!origin || !isAllowedApiCorsOrigin(origin)) {
		return new Response(null, { status: 204 });
	}
	return new Response(null, { status: 204, headers: corsHeadersFor(origin) });
}
