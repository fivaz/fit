import type { NextConfig } from "next";

import { withSentryConfig } from "@sentry/nextjs";
import { config as loadEnv } from "dotenv";
import { execSync } from "node:child_process";
import path from "node:path";

import { resolvePublicApiBaseUrl, resolvePublicAuthBaseUrl } from "./lib/env/mobile-dev-url";
import pkg from "./package.json";

const repoRoot = path.resolve(__dirname, "../..");
loadEnv({ path: path.join(repoRoot, ".env") });
loadEnv({ path: path.join(repoRoot, ".env.local") });

function resolveGitCommitHash(): string | undefined {
	try {
		return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim() || undefined;
	} catch {
		return undefined;
	}
}

function publicEnvFromProcess(): Record<string, string> {
	const env: Record<string, string> = {};
	for (const [key, value] of Object.entries(process.env)) {
		if (key.startsWith("NEXT_PUBLIC_") && value) env[key] = value;
	}
	return env;
}

function resolvedAppPublicEnv(): Record<string, string> {
	const env: Record<string, string> = {
		NEXT_PUBLIC_APP_VERSION: pkg.version,
	};

	if (process.env.NODE_ENV !== "production") {
		const gitHash = resolveGitCommitHash();
		if (gitHash) env.NEXT_PUBLIC_APP_GIT_HASH = gitHash;
	}

	return env;
}

function resolvedMobilePublicEnv(): Record<string, string> {
	const env: Record<string, string> = {};
	const apiBaseUrl = resolvePublicApiBaseUrl();
	const authBaseUrl = resolvePublicAuthBaseUrl();
	if (apiBaseUrl) env.NEXT_PUBLIC_API_BASE_URL = apiBaseUrl;
	if (authBaseUrl) env.NEXT_PUBLIC_AUTH_BASE_URL = authBaseUrl;
	return env;
}

/** Hostnames (and `a.b.*.*`-style patterns per Next.js) allowed to hit `/_next/*` in dev. Comma-separated. */
function parseAllowedDevOriginsFromEnv(): string[] {
	const raw = process.env.NEXT_ALLOWED_DEV_ORIGINS;
	if (!raw?.trim()) return [];
	return raw
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
}

/** Hostname from `MOBILE_DEV_URL` so Cloudflare Tunnel HMR (`/_next/webpack-hmr`) is allowed. */
function allowedDevOriginFromMobileDevUrl(): string[] {
	const raw = process.env.MOBILE_DEV_URL?.trim();
	if (!raw) return [];
	try {
		return [new URL(raw).hostname];
	} catch {
		return [];
	}
}

// When set (including defaults below), dev uses block mode for disallowed origins instead of warn-only.
// Wildcards follow Next’s `isCsrfOriginAllowed` rules (dot-separated segments; `*` per segment).
const allowedDevOrigins: string[] = [
	...new Set([
		...parseAllowedDevOriginsFromEnv(),
		...allowedDevOriginFromMobileDevUrl(),
		"127.0.0.1",
		"192.168.*.*",
		"10.*.*.*",
	]),
];

const nextConfig: NextConfig = {
	transpilePackages: ["@fit/shared"],
	productionBrowserSourceMaps: false,
	allowedDevOrigins,
	// `output: "export"` is only enabled for the dedicated static bundle build path.
	output: process.env.NEXT_BUILD_TARGET === "static" ? "export" : undefined,
	images: {
		unoptimized: process.env.NEXT_BUILD_TARGET === "static",
	},
	// `build-static.mjs` sets NEXT_DIST_DIR=.next-static for the mobile export build.
	distDir: process.env.NEXT_DIST_DIR ?? ".next",
	env: {
		...publicEnvFromProcess(),
		...resolvedAppPublicEnv(),
		...resolvedMobilePublicEnv(),
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
