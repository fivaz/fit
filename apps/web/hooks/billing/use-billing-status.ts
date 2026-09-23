"use client";

import { useCallback, useEffect, useState } from "react";

import type { BillingStatusUI } from "@fit/shared";

import { getBillingStatus } from "@/lib/billing/api";

type FetchState = {
	requestId: number;
	status?: BillingStatusUI;
	settled: boolean;
};

const initialFetchState: FetchState = { requestId: 0, settled: false };

export function useBillingStatus() {
	const [requestId, setRequestId] = useState(0);
	const [fetchState, setFetchState] = useState<FetchState>(initialFetchState);

	useEffect(() => {
		let cancelled = false;

		void getBillingStatus()
			.then((status) => {
				if (!cancelled) setFetchState({ requestId, status, settled: true });
			})
			.catch(() => {
				if (!cancelled) setFetchState({ requestId, settled: true });
			});

		return () => {
			cancelled = true;
		};
	}, [requestId]);

	const isLoading = !fetchState.settled || fetchState.requestId !== requestId;

	// Stable identity: consumers list this in effect deps, so a new function each render would
	// re-trigger their effect (and call it again) forever.
	const refetch = useCallback(() => setRequestId((id) => id + 1), []);

	return { status: fetchState.status, isLoading, refetch };
}
