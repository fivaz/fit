"use client";

import { useEffect } from "react";

import { onAppForeground } from "@/lib/mobile/app-lifecycle";
import { onNetworkAvailable } from "@/lib/mobile/network";
import { offlineDataAdapters } from "@/lib/offline/data-adapters";

export function NetworkSync() {
	useEffect(() => {
		void offlineDataAdapters.syncNow();

		return onNetworkAvailable(() => {
			void offlineDataAdapters.syncNow();
		});
	}, []);

	useEffect(() => {
		return onAppForeground(() => {
			void offlineDataAdapters.syncNow();
		});
	}, []);

	return null;
}
