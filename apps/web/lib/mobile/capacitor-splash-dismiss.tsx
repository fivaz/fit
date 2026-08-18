"use client";

import { useEffect } from "react";

import { isNativeMobileRuntime } from "@/lib/mobile/runtime";

/**
 * Hides the native splash as soon as the web bundle is interactive (Capacitor default timeout otherwise logs a warning).
 */
export function CapacitorSplashDismiss() {
	useEffect(() => {
		if (!isNativeMobileRuntime()) return;
		void import("@capacitor/splash-screen").then(({ SplashScreen }) => SplashScreen.hide());
	}, []);

	return null;
}
