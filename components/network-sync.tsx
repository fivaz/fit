"use client";

import { useEffect } from "react";

import { onAppForeground } from "@/lib/mobile/app-lifecycle";
import { onNetworkAvailable } from "@/lib/mobile/network";
import { isOfflineEnabled } from "@/lib/offline/config";
import { offlineDataAdapters } from "@/lib/offline/data-adapters";

export function NetworkSync() {
	useEffect(() => {
		if (!isOfflineEnabled()) return;
		void offlineDataAdapters.syncNow();

		return onNetworkAvailable(() => {
			void offlineDataAdapters.syncNow();
		});
	}, []);

	useEffect(() => {
		if (!isOfflineEnabled()) return;
		return onAppForeground(() => {
			void offlineDataAdapters.syncNow();
		});
	}, []);

	return null;
}
