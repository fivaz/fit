"use client";

import "./globals.css";

import { useEffect } from "react";

import * as Sentry from "@sentry/nextjs";

import { ErrorDisplay } from "@/components/error-display";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
	useEffect(() => {
		Sentry.captureException(error);
	}, [error]);

	return (
		<html lang="en">
			<body className="antialiased">
				<ErrorDisplay
					error={error}
					variant="standalone"
					onReload={() => {
						window.location.reload();
					}}
				/>
			</body>
		</html>
	);
}
