import type { NextConfig } from "next";

import { withSentryConfig } from "@sentry/nextjs";

import pkg from "./package.json";

/** Hostnames (and `a.b.*.*`-style patterns per Next.js) allowed to hit `/_next/*` in dev. Comma-separated. */
function parseAllowedDevOriginsFromEnv(): string[] {
	const raw = process.env.NEXT_ALLOWED_DEV_ORIGINS;
	if (!raw?.trim()) return [];
	return raw
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
}

// When set (including defaults below), dev uses block mode for disallowed origins instead of warn-only.
// Wildcards follow Next’s `isCsrfOriginAllowed` rules (dot-separated segments; `*` per segment).
const allowedDevOrigins: string[] = [
	...parseAllowedDevOriginsFromEnv(),
	"127.0.0.1",
	"192.168.*.*",
	"10.*.*.*",
];

const nextConfig: NextConfig = {
	/* config options here */
	allowedDevOrigins,
	// `output: "export"` is only enabled for the dedicated static bundle build path.
	output: process.env.NEXT_BUILD_TARGET === "static" ? "export" : undefined,
	images: {
		unoptimized: process.env.NEXT_BUILD_TARGET === "static",
	},
	// Separate output dir when NEXT_DIST_DIR is set (e.g. E2E on :3001) so a second `next dev`
	// does not fight `.next/dev/lock` with the main dev server on :3000.
	distDir: process.env.NEXT_DIST_DIR ?? ".next",
	env: {
		NEXT_PUBLIC_APP_VERSION: pkg.version,
	},
};

const sentryOptions = {
	// For all available options, see:
	// https://www.npmjs.com/package/@sentry/webpack-plugin#options

	org: "fivaz-lb",

	project: "fit-tracker",

	// Only print logs for uploading source maps in CI
	silent: !process.env.CI,

	// For all available options, see:
	// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

	// Upload a larger set of source maps for prettier stack traces (increases build time)
	widenClientFileUpload: true,

	// Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
	// This can increase your server load as well as your hosting bill.
	// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
	// side errors will fail.
	// tunnelRoute: "/monitoring",

	webpack: {
		// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
		// See the following for more information:
		// https://docs.sentry.io/product/crons/
		// https://vercel.com/docs/cron-jobs
		automaticVercelMonitors: true,

		// Tree-shaking options for reducing bundle size
		treeshake: {
			// Automatically tree-shake Sentry logger statements to reduce bundle size
			removeDebugLogging: true,
		},
	},
};

export default process.env.NODE_ENV === "production"
	? withSentryConfig(nextConfig, sentryOptions)
	: nextConfig;
