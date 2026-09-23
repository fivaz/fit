import Stripe from "stripe";

import { ApiError } from "@/api-error";

let stripeSingleton: Stripe | null = null;

/**
 * Lazy — constructing Stripe with an empty key throws synchronously, and this module is
 * imported at app boot (via billing.controller.ts registered in app.module.ts), so an eager
 * client would crash the whole API whenever STRIPE_SECRET_KEY is unset, not just billing.
 */
export function getStripeClient(): Stripe {
	if (!process.env.STRIPE_SECRET_KEY) {
		throw new ApiError("Billing is not configured", 503);
	}

	if (!stripeSingleton) {
		stripeSingleton = new Stripe(process.env.STRIPE_SECRET_KEY, {
			apiVersion: "2026-08-26.dahlia",
		});
	}

	return stripeSingleton;
}
