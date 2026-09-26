"use client";

import { ReactNode, useSyncExternalStore } from "react";

import { isNativeMobileRuntime } from "@/lib/mobile/runtime";

// Whether this is the iOS app never changes while the page is open, so there's nothing to subscribe to.
function subscribeToNothing() {
	return () => {};
}

function isWebBrowser(): boolean {
	return !isNativeMobileRuntime();
}

/**
 * The static export pre-renders as if inside the iOS app: Apple's rules forbid pointing iOS users to
 * other ways to pay, so web-only text must never flash there. On the web it appears once hydrated.
 */
function assumeIosAppWhilePrerendering(): boolean {
	return false;
}

function useIsWebBrowser(): boolean {
	return useSyncExternalStore(subscribeToNothing, isWebBrowser, assumeIosAppWhilePrerendering);
}

/** Renders its content on the website only, never in the iOS app (e.g. paying through Stripe). */
export function WebOnly({ children }: { children: ReactNode }) {
	return useIsWebBrowser() ? children : null;
}

/** Picks the website or the iOS app wording (e.g. "Terms & Refunds" vs "Terms"). */
export function WebOrApp({ web, app }: { web: ReactNode; app: ReactNode }) {
	return useIsWebBrowser() ? web : app;
}
