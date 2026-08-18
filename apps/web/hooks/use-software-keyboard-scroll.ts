"use client";

import { useEffect, useRef } from "react";

import { useSoftwareKeyboardInsets } from "@/hooks/use-software-keyboard-open";

type UseSoftwareKeyboardScrollOptions = {
	/** Reset scrollTop when the keyboard closes (full-page shells). */
	resetScrollOnClose?: boolean;
	/** Auto-scroll focused inputs inside the container (bottom sheets). */
	autoScrollOnFocus?: boolean;
};

function runScrollIntoView(element: HTMLElement, block: ScrollLogicalPosition) {
	const scroll = () => element.scrollIntoView({ block, behavior: "smooth" });
	requestAnimationFrame(scroll);
	window.setTimeout(scroll, 400);
}

/** Scroll focused field into view after the keyboard animates (iOS/Capacitor). */
export function scrollFieldIntoView(element: HTMLElement) {
	runScrollIntoView(element, "nearest");
}

/** Scroll the submit button into view (e.g. when password field is focused). */
export function scrollPrimaryActionIntoView(element: HTMLElement) {
	runScrollIntoView(element, "end");
}

export function useSoftwareKeyboardScroll<T extends HTMLElement = HTMLElement>(
	options: UseSoftwareKeyboardScrollOptions = {},
) {
	const { resetScrollOnClose = false, autoScrollOnFocus = false } = options;
	const containerRef = useRef<T>(null);
	const { open: keyboardOpen, height: keyboardHeight } = useSoftwareKeyboardInsets();

	useEffect(() => {
		if (!resetScrollOnClose || keyboardOpen) return;
		containerRef.current?.scrollTo({ top: 0 });
	}, [keyboardOpen, resetScrollOnClose]);

	useEffect(() => {
		if (!autoScrollOnFocus || !keyboardOpen) return;

		const container = containerRef.current;
		if (!container) return;

		const handleFocusIn = (event: FocusEvent) => {
			const target = event.target;
			if (!(target instanceof HTMLElement) || !container.contains(target)) return;
			scrollFieldIntoView(target);
		};

		container.addEventListener("focusin", handleFocusIn);
		return () => container.removeEventListener("focusin", handleFocusIn);
	}, [autoScrollOnFocus, keyboardOpen]);

	return {
		containerRef,
		keyboardOpen,
		keyboardHeight,
		scrollFieldIntoView,
		scrollPrimaryActionIntoView,
	};
}
