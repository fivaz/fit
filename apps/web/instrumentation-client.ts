// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Checked before React (and Capacitor's JS) loads: the iOS app serves its bundle from
// capacitor://localhost, and Capacitor's native bridge defines window.Capacitor at document start.
const isIosApp =
	typeof window !== "undefined" &&
	(window.location.protocol === "capacitor:" || window.Capacitor?.isNativePlatform?.() === true);

if (process.env.NODE_ENV === "production") {
	Sentry.init({
		dsn: "https://53346ababcca5c37041d2b5cd7cfaae3@o4508857555550208.ingest.de.sentry.io/4510635945492560",

		// dev/staging/prod, set by the Azure deploy workflow. Builds made elsewhere (e.g. an iOS build
		// installed from a laptop) report as "local" rather than Sentry's default "production".
		environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || "local",

		// Session Replay records screens, including body metrics. The iOS app leaves it out so its App
		// Store privacy declaration (ios/App/App/PrivacyInfo.xcprivacy) stays accurate and minimal.
		integrations: isIosApp ? [] : [Sentry.replayIntegration()],

		// Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
		tracesSampleRate: 1,
		// Enable logs to be sent to Sentry
		enableLogs: true,

		// Define how likely Replay events are sampled.
		// This sets the sample rate to be 10%. You may want this to be 100% while
		// in development and sample at a lower rate in production
		replaysSessionSampleRate: 0.1,

		// Define how likely Replay events are sampled when an error occurs.
		replaysOnErrorSampleRate: 1.0,

		// Enable sending user PII (Personally Identifiable Information)
		// https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
		// Off in the iOS app: no IP address or other identifying data, so its diagnostics stay
		// "not linked to the user" in the App Store privacy declaration.
		sendDefaultPii: !isIosApp,
	});
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
