"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
	getOfflineSnapshot,
	type OfflineSnapshot,
	subscribeToOfflineStore,
} from "@/lib/offline/data-adapters";

/**
 * Reads part of the device cache and re-renders when it changes, so a screen can show saved data
 * straight away instead of waiting on the API (e.g. while a scaled-to-zero container boots).
 *
 * `select` must return a value from the snapshot (or `fallback`) rather than build a new object,
 * and `fallback` must be a stable constant: both are compared by reference on every render. The
 * static export pre-renders with `fallback`, and the cached value follows right after hydration.
 */
export function useOfflineCache<T>(select: (snapshot: OfflineSnapshot) => T, fallback: T): T {
	const getSnapshot = useCallback(() => select(getOfflineSnapshot()), [select]);
	const getPrerenderSnapshot = useCallback(() => fallback, [fallback]);
	return useSyncExternalStore(subscribeToOfflineStore, getSnapshot, getPrerenderSnapshot);
}
