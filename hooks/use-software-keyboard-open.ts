"use client";

import { useEffect, useState } from "react";

import { isNativeMobileRuntime } from "@/lib/mobile/runtime";

const KEYBOARD_HEIGHT_THRESHOLD_PX = 120;

function isKeyboardOpenFromVisualViewport(): boolean {
	const viewport = window.visualViewport;
	if (!viewport) return false;
	return window.innerHeight - viewport.height > KEYBOARD_HEIGHT_THRESHOLD_PX;
}

/**
 * True while the software keyboard is visible (Capacitor on device, visualViewport elsewhere).
 */
export function useSoftwareKeyboardOpen(): boolean {
	const [keyboardOpen, setKeyboardOpen] = useState(false);

	useEffect(() => {
		let cancelled = false;
		const cleanups: Array<() => void> = [];

		const attachVisualViewport = () => {
			const viewport = window.visualViewport;
			if (!viewport) return;

			const update = () => {
				if (!cancelled) setKeyboardOpen(isKeyboardOpenFromVisualViewport());
			};

			update();
			viewport.addEventListener("resize", update);
			viewport.addEventListener("scroll", update);
			cleanups.push(() => {
				viewport.removeEventListener("resize", update);
				viewport.removeEventListener("scroll", update);
			});
		};

		if (isNativeMobileRuntime()) {
			void import("@capacitor/keyboard").then(({ Keyboard }) => {
				if (cancelled) return;

				void Keyboard.addListener("keyboardWillShow", () => setKeyboardOpen(true)).then((handle) =>
					cleanups.push(() => void handle.remove()),
				);
				void Keyboard.addListener("keyboardWillHide", () => setKeyboardOpen(false)).then((handle) =>
					cleanups.push(() => void handle.remove()),
				);
			});
		}

		attachVisualViewport();

		return () => {
			cancelled = true;
			for (const cleanup of cleanups) cleanup();
		};
	}, []);

	return keyboardOpen;
}
