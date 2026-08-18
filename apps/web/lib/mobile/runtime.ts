"use client";

declare global {
	interface Window {
		Capacitor?: {
			isNativePlatform?: () => boolean;
		};
	}
}

export function isNativeMobileRuntime(): boolean {
	if (typeof window === "undefined") return false;
	return window.Capacitor?.isNativePlatform?.() === true;
}
