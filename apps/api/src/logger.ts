import * as Sentry from "@sentry/node";

type LogLevel = "info" | "warn" | "error";

interface LogOptions {
	level?: LogLevel;
	extra?: Record<string, unknown>;
}

export function logError(error: unknown, context: string, options: LogOptions = {}) {
	const { level = "error", extra: initialContext } = options;
	const message = error instanceof Error ? error.message : String(error);
	const extra = { ...initialContext, context };

	if (process.env.NODE_ENV === "development") {
		console.group(`[DEV-LOG] ${level.toUpperCase()}: ${message}`);
		console.log("Details:", error);
		if (extra) console.table(extra);
		console.groupEnd();
		return;
	}

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
