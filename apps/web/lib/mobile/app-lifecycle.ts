"use client";

import { App } from "@capacitor/app";

import { isNativeMobileRuntime } from "@/lib/mobile/runtime";

function isBrowser() {
	return typeof window !== "undefined";
}

export function onAppForeground(callback: () => void): () => void {
	if (!isBrowser()) return () => {};

	if (isNativeMobileRuntime()) {
		let isSubscribed = true;
		const removers: Array<() => void> = [];

		void App.addListener("resume", callback).then((listener) => {
			const remove = () => {
				void listener.remove();
			};

			if (!isSubscribed) {
				remove();
				return;
			}

			removers.push(remove);
		});

		void App.addListener("appStateChange", ({ isActive }) => {
			if (isActive) callback();
		}).then((listener) => {
			const remove = () => {
				void listener.remove();
			};

			if (!isSubscribed) {
				remove();
				return;
			}

			removers.push(remove);
		});

		return () => {
			isSubscribed = false;
			for (const remove of removers) {
				remove();
			}
		};
	}

	const handleFocus = () => {
		callback();
	};
	const handleVisibilityChange = () => {
		if (document.visibilityState === "visible") callback();
	};

	window.addEventListener("focus", handleFocus);
	document.addEventListener("visibilitychange", handleVisibilityChange);

	return () => {
		window.removeEventListener("focus", handleFocus);
		document.removeEventListener("visibilitychange", handleVisibilityChange);
	};
}
