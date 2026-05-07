"use client";

import { Network } from "@capacitor/network";

import { isNativeMobileRuntime } from "@/lib/mobile/runtime";

function isBrowser() {
	return typeof window !== "undefined";
}

export async function isNetworkAvailable(): Promise<boolean> {
	if (!isBrowser()) return false;

	if (isNativeMobileRuntime()) {
		try {
			const status = await Network.getStatus();
			return status.connected;
		} catch {
			return window.navigator.onLine;
		}
	}

	return window.navigator.onLine;
}

export function onNetworkAvailable(callback: () => void): () => void {
	if (!isBrowser()) return () => {};

	if (isNativeMobileRuntime()) {
		let isSubscribed = true;
		let removeListener: (() => void) | undefined;

		void Network.addListener("networkStatusChange", (status) => {
			if (status.connected) callback();
		})
			.then((listener) => {
				removeListener = () => {
					void listener.remove();
				};

				if (!isSubscribed) {
					removeListener();
				}
			})
			.catch(() => {
				if (isSubscribed) {
					window.addEventListener("online", callback);
					removeListener = () => {
						window.removeEventListener("online", callback);
					};
				}
			});

		return () => {
			isSubscribed = false;
			removeListener?.();
		};
	}

	window.addEventListener("online", callback);

	return () => {
		window.removeEventListener("online", callback);
	};
}
