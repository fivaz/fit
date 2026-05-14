import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/consts";
import { corsHeadersFor, corsPreflightResponse, isAllowedApiCorsOrigin } from "@/lib/cors";

const PUBLIC_PATHS = [ROUTES.LOGIN, ROUTES.REGISTER, "/logout"];

function getProgramsShellRewriteUrl(req: NextRequest): URL | null {
	const detailPrefix = `${ROUTES.PROGRAMS}/`;
	const pathname = req.nextUrl.pathname;
	if (!pathname.startsWith(detailPrefix)) return null;

	const detailPath = pathname.slice(detailPrefix.length);
	if (!detailPath || detailPath.includes("/")) return null;

	const rewriteUrl = req.nextUrl.clone();
	rewriteUrl.pathname = ROUTES.PROGRAMS;
	return rewriteUrl;
}

/** CORS for Capacitor / cross-origin clients hitting `/api/*` (see `lib/cors.ts`). */
function applyApiCors(request: NextRequest): NextResponse | null {
	const { pathname } = request.nextUrl;
	if (pathname !== "/api" && !pathname.startsWith("/api/")) return null;

	const preflight = corsPreflightResponse(request);
	if (preflight) {
		return new NextResponse(preflight.body, {
			status: preflight.status,
			statusText: preflight.statusText,
			headers: preflight.headers,
		});
	}

	const origin = request.headers.get("origin")?.trim();
	if (!origin || !isAllowedApiCorsOrigin(origin)) {
		return null;
	}

	const response = NextResponse.next();
	corsHeadersFor(origin).forEach((value, key) => {
		response.headers.set(key, value);
	});
	return response;
}

export async function proxy(req: NextRequest) {
	const pathname = req.nextUrl.pathname;
	// API routes enforce auth in handlers (JSON errors); do not HTML-redirect here.
	if (pathname === "/api" || pathname.startsWith("/api/")) {
		const corsResponse = applyApiCors(req);
		if (corsResponse) return corsResponse;
		return NextResponse.next();
	}

	if (PUBLIC_PATHS.includes(pathname)) {
		return NextResponse.next();
	}

	const session = await auth.api.getSession({
		headers: req.headers,
	});

	if (!session) {
		console.warn(`[PROXY] No token found for: ${pathname}. Redirecting to Login.`);
		return NextResponse.redirect(new URL(ROUTES.LOGIN, req.url));
	}

	const programsShellRewriteUrl = getProgramsShellRewriteUrl(req);
	if (programsShellRewriteUrl) {
		return NextResponse.rewrite(programsShellRewriteUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - .well-known (security/manifest files)
		 * - All files with extensions (e.g., .svg, .png, .jpg, .json)
		 */
		"/api/:path*",
		"/((?!api|_next/static|_next/image|.well-known|favicon.ico|sw.js|manifest.json|.*\\..*).*)",
	],
};
