"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { APP_NAME, ROUTES } from "@/lib/consts";
import { cn } from "@/lib/utils";

function collectCauses(error: unknown): string[] {
	const messages: string[] = [];
	let current: unknown = error;
	const seen = new Set<unknown>();
	while (current instanceof Error && !seen.has(current)) {
		seen.add(current);
		const { cause } = current;
		if (cause === undefined || cause === null) break;
		if (cause instanceof Error) {
			messages.push(cause.message);
			current = cause;
		} else {
			messages.push(String(cause));
			break;
		}
	}
	return messages;
}

type ErrorDisplayProps = {
	error: Error & { digest?: string };
	/** Next.js route segment recovery */
	reset?: () => void;
	/** Used by `global-error` where `reset` is not available */
	onReload?: () => void;
	variant?: "embedded" | "standalone";
	className?: string;
};

export function ErrorDisplay({
	error,
	reset,
	onReload,
	variant = "embedded",
	className,
}: ErrorDisplayProps) {
	const isDev = process.env.NODE_ENV === "development";
	const message = error.message?.trim() || "No error message was provided.";
	const digest = error.digest;
	const causes = collectCauses(error);

	const shell =
		variant === "standalone"
			? "flex min-h-svh flex-col items-center justify-center bg-gray-50 p-6 dark:bg-gray-900"
			: "flex min-h-[50vh] flex-col justify-center px-5 py-12";

	return (
		<div className={cn(shell, className)} role="alert">
			<div className="border-destructive/30 bg-background w-full max-w-md rounded-lg border p-6 shadow-sm">
				<h1 className="text-destructive text-lg font-semibold">Something went wrong</h1>
				<p className="text-muted-foreground mt-1 text-sm">
					{APP_NAME} hit an unexpected error. Details below may help you or support fix the issue.
				</p>

				<div className="bg-muted/40 mt-4 rounded-md border px-3 py-2">
					<p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Error</p>
					<p className="text-foreground mt-1 font-mono text-sm break-words">{message}</p>
				</div>

				{causes.length > 0 && (
					<div className="bg-muted/40 mt-3 rounded-md border px-3 py-2">
						<p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
							Cause
						</p>
						<ul className="text-foreground mt-1 list-inside list-disc font-mono text-sm">
							{causes.map((line, i) => (
								<li key={i} className="break-words">
									{line}
								</li>
							))}
						</ul>
					</div>
				)}

				{digest ? (
					<p className="text-muted-foreground mt-3 text-xs">
						<span className="font-medium">Reference id:</span>{" "}
						<code className="bg-muted rounded px-1 py-0.5 font-mono">{digest}</code>
					</p>
				) : null}

				{isDev && error.stack ? (
					<details className="mt-4 rounded-md border border-dashed p-3 text-left">
						<summary className="text-muted-foreground cursor-pointer text-sm font-medium">
							Stack trace (development only)
						</summary>
						<pre className="text-muted-foreground mt-2 max-h-64 overflow-auto font-mono text-xs break-all whitespace-pre-wrap">
							{error.stack}
						</pre>
					</details>
				) : null}

				<div className="mt-6 flex flex-wrap gap-2">
					{reset ? (
						<Button type="button" onClick={reset}>
							Try again
						</Button>
					) : null}
					{!reset && onReload ? (
						<Button type="button" onClick={onReload}>
							Reload page
						</Button>
					) : null}
					<Button variant="outline" asChild>
						<Link href={ROUTES.HOME}>Go home</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
