import * as Sentry from "@sentry/nextjs";

/**
 * Startup milestones, each measured from the start of the page load (in the iOS app, from when the
 * WebView starts loading the bundle), so they include the JS boot and any wait on the API.
 * - `app.dashboard_shown`: the user can see and use the app.
 * - `app.session_resolved`: the API answered the session check (roughly the API's cold start).
 */
export type StartupMilestone = "app.dashboard_shown" | "app.session_resolved";

type MilestoneAttributes = Record<string, string | boolean>;

const reportedMilestones = new Set<StartupMilestone>();
/** Only a load that opens straight on the dashboard measures startup; see `stopStartupTiming`. */
let isTimingStartup = true;

/**
 * Called by screens that come before the dashboard (login, sign-up): the time a user spends there
 * isn't startup, so this page load no longer reports milestones.
 */
export function stopStartupTiming(): void {
	isTimingStartup = false;
}

/**
 * Records a milestone once per page load, as a Sentry span (op `app.startup`, queryable by name and
 * `app.version` in Sentry's trace explorer) and as a Performance API measure for local devtools.
 * Sentry only initializes in production builds; elsewhere the span is a no-op.
 */
export function reportStartupMilestone(
	milestone: StartupMilestone,
	attributes: MilestoneAttributes = {},
): void {
	if (typeof window === "undefined" || !isTimingStartup || reportedMilestones.has(milestone)) {
		return;
	}
	reportedMilestones.add(milestone);

	performance.measure(milestone, { start: 0, end: performance.now() });

	// Its own transaction (not a child of the page-load one), so it's kept even when the page-load
	// transaction has already ended by the time a slow API answers.
	Sentry.startInactiveSpan({
		name: milestone,
		op: "app.startup",
		startTime: performance.timeOrigin / 1000,
		forceTransaction: true,
		attributes: {
			"app.version": process.env.NEXT_PUBLIC_APP_VERSION ?? "unknown",
			...attributes,
		},
	}).end();
}
