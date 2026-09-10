import * as Sentry from "@sentry/nextjs";

type LogLevel = "info" | "warn" | "error";

interface LogOptions {
	level?: LogLevel;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	extra?: Record<string, any>;
}

export function logError(error: unknown, context: string, options: LogOptions = {}) {
	const { level = "error", extra: initialContext } = options;
	const message = error instanceof Error ? error.message : String(error);

	const extra = { ...initialContext, context };

	if (process.env.NODE_ENV === "development") {
		const styles = {
			info: "color: #007bff; font-weight: bold;",
			warn: "color: #ffc107; font-weight: bold;",
			error: "color: #dc3545; font-weight: bold;",
		};

		console.group(`[DEV-LOG] ${level.toUpperCase()}: ${message}`);
		console.log("%cDetails:", styles[level], error);
		if (extra) console.table(extra);
		console.groupEnd();
	} else {
		Sentry.withScope((scope) => {
			if (extra) {
				scope.setExtras(extra);
			}
			scope.setLevel(level === "info" ? "info" : level === "warn" ? "warning" : "error");

			if (error instanceof Error) {
				Sentry.captureException(error);
			} else {
				Sentry.captureMessage(message);
			}
		});
	}
}
