"use client";

import { useEffect } from "react";

import { warmUpApi } from "@/lib/api-client";

/** Wakes the API container as soon as the app opens; see `warmUpApi`. */
export function ApiWarmUp() {
	useEffect(() => {
		warmUpApi();
	}, []);

	return null;
}
