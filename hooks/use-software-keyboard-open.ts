"use client";

import { useEffect, useState } from "react";

import { isNativeMobileRuntime } from "@/lib/mobile/runtime";

const KEYBOARD_HEIGHT_THRESHOLD_PX = 120;

export type SoftwareKeyboardInsets = {
	open: boolean;
	height: number;
};

function getKeyboardHeightFromVisualViewport(): number {
	const viewport = window.visualViewport;
	if (!viewport) return 0;
	return Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
}

function getKeyboardInsetsFromVisualViewport(): SoftwareKeyboardInsets {
	const height = getKeyboardHeightFromVisualViewport();
	return {
		open: height > KEYBOARD_HEIGHT_THRESHOLD_PX,
		height,
	};
}

/**
 * Keyboard visibility and height (Capacitor on device, visualViewport elsewhere).
 */
export function useSoftwareKeyboardInsets(): SoftwareKeyboardInsets {
	const [insets, setInsets] = useState<SoftwareKeyboardInsets>({ open: false, height: 0 });

	useEffect(() => {
		let cancelled = false;
		const cleanups: Array<() => void> = [];

		const attachVisualViewport = () => {
			const viewport = window.visualViewport;
			if (!viewport) return;

			const update = () => {
				if (!cancelled) setInsets(getKeyboardInsetsFromVisualViewport());
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

				void Keyboard.addListener("keyboardWillShow", (info) => {
					setInsets({ open: true, height: info.keyboardHeight });
				}).then((handle) => cleanups.push(() => void handle.remove()));

				void Keyboard.addListener("keyboardWillHide", () => {
					setInsets({ open: false, height: 0 });
				}).then((handle) => cleanups.push(() => void handle.remove()));
			});
		} else {
			attachVisualViewport();
		}

		return () => {
			cancelled = true;
			for (const cleanup of cleanups) cleanup();
		};
	}, []);

	return insets;
}

/**
 * True while the software keyboard is visible (Capacitor on device, visualViewport elsewhere).
 */
export function useSoftwareKeyboardOpen(): boolean {
	return useSoftwareKeyboardInsets().open;
}

function runScrollIntoView(element: HTMLElement, block: ScrollLogicalPosition) {
	const scroll = () => element.scrollIntoView({ block, behavior: "smooth" });
	requestAnimationFrame(scroll);
	window.setTimeout(scroll, 400);
}

/** Scroll focused field into view after the keyboard animates (iOS/Capacitor). */
export function scrollDrawerFieldIntoView(element: HTMLElement) {
	runScrollIntoView(element, "nearest");
}
