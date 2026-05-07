"use client";

import { useEffect } from "react";

import { onNetworkAvailable } from "@/lib/mobile/network";
import { offlineDataAdapters } from "@/lib/offline/data-adapters";

export function NetworkSync() {
	useEffect(() => {
		void offlineDataAdapters.syncNow();

		return onNetworkAvailable(() => {
			void offlineDataAdapters.syncNow();
		});
	}, []);

	return null;
}
