"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

import { isNativeMobileRuntime } from "@/lib/mobile/runtime";

/**
 * Keeps the native status bar transparent (overlay) and picks icon contrast from the active theme.
 * Style.Dark = light icons (dark backgrounds); Style.Light = dark icons (light backgrounds).
 */
export function CapacitorStatusBarSync() {
	const { resolvedTheme } = useTheme();

	useEffect(() => {
		if (!isNativeMobileRuntime()) return;

		void import("@capacitor/status-bar").then(async ({ StatusBar, Style }) => {
			await StatusBar.setOverlaysWebView({ overlay: true });
			const isDark = resolvedTheme === "dark";
			await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
		});
	}, [resolvedTheme]);

	return null;
}
