"use client";

import * as React from "react";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { toast } from "sonner";

import { SettingsDetails } from "@/components/settings/settings-details";
import { useBillingStatus } from "@/hooks/billing/use-billing-status";
import { useOfflineCache } from "@/hooks/offline/use-offline-cache";
import { getBodyMetrics } from "@/lib/body-metrics/api";
import { BodyMetricsUI, getEmptyBodyMetrics } from "@/lib/body-metrics/type";
import { ROUTES } from "@/lib/consts";
import type { OfflineSnapshot } from "@/lib/offline/data-adapters";

const EMPTY_BODY_METRICS = getEmptyBodyMetrics();

function selectCachedBodyMetrics(snapshot: OfflineSnapshot): BodyMetricsUI {
	return snapshot.bodyMetrics ?? EMPTY_BODY_METRICS;
}

export default function SettingsPage() {
	// Saved values show right away; the API's answer replaces them once it arrives.
	const cachedBodyMetrics = useOfflineCache(selectCachedBodyMetrics, EMPTY_BODY_METRICS);
	const [loadedBodyMetrics, setLoadedBodyMetrics] = useState<BodyMetricsUI | null>(null);
	const bodyMetrics = loadedBodyMetrics ?? cachedBodyMetrics;
	const billing = useBillingStatus();

	useEffect(() => {
		void getBodyMetrics().then((metrics) => {
			if (!metrics) return;
			setLoadedBodyMetrics(metrics);
		});
	}, []);

	return (
		<div className="relative flex w-full flex-col">
			{/* Header */}
			<div className="flex items-start justify-between pb-4">
				<div>
					<h1 className="text-foreground text-2xl font-bold">Settings</h1>
				</div>
			</div>
			<Suspense fallback={null}>
				<CheckoutReturnHandler onCheckoutSuccess={billing.refetch} />
			</Suspense>
			<SettingsDetails bodyMetrics={bodyMetrics} billing={billing} />
		</div>
	);
}

/** Reads Stripe's ?checkout=success|cancel redirect once, then strips it from the URL. */
function CheckoutReturnHandler({ onCheckoutSuccess }: { onCheckoutSuccess: () => void }) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const checkout = searchParams.get("checkout");

	useEffect(() => {
		if (!checkout) return;

		if (checkout === "success") {
			onCheckoutSuccess();
			// Fixed id: a re-run of this effect (e.g. React StrictMode in dev) replaces the toast
			// instead of stacking a duplicate.
			toast.success("Payment received. Updating your credits...", { id: "checkout-success" });
			// The Stripe webhook that credits the account can land after the redirect back here,
			// so refetch once more shortly after in case the first fetch saw the old balance. Not
			// cleared on cleanup: the effect re-runs (and cleans up) as soon as router.replace
			// strips ?checkout below, which would cancel this before it fires.
			setTimeout(onCheckoutSuccess, 2500);
		}

		router.replace(ROUTES.SETTINGS);
	}, [checkout, router, onCheckoutSuccess]);

	return null;
}
