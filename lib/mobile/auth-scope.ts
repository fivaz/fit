"use client";

import { isNativeMobileRuntime } from "@/lib/mobile/runtime";

/**
 * iOS v1 auth: email/password only. OAuth redirects are unreliable in WKWebView
 * and are deferred until a native or universal-link flow exists.
 */
export function isEmailPasswordOnlyAuthScope(): boolean {
	return isNativeMobileRuntime();
}
