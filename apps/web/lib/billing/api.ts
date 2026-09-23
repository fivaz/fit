import { API_PATHS, type BillingStatusUI } from "@fit/shared";

import { apiFetch } from "@/lib/api-client";

export function getBillingStatus() {
	return apiFetch<BillingStatusUI>(API_PATHS.billingStatus);
}

export function createCheckoutSession() {
	return apiFetch<{ url: string }>(API_PATHS.billingCheckout, { method: "POST" });
}
