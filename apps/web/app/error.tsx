"use client";

import { useEffect } from "react";

import * as Sentry from "@sentry/nextjs";

import { ErrorDisplay } from "@/components/error-display";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		Sentry.captureException(error);
	}, [error]);

	return <ErrorDisplay error={error} reset={reset} />;
}
