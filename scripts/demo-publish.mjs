#!/usr/bin/env node
/**
 * Uploads the converted demo clips (demo-output/<clip>.mp4 and <clip>-poster.webp) to the R2 bucket
 * behind the CDN, so the portfolio can load them from there instead of keeping its own copies.
 * Run it after `pnpm demo` once the clips have been reviewed; it never runs as part of recording.
 *
 * Keys are stable (<prefix>/<file>), so the portfolio's URLs never change. Files whose content is
 * already in the bucket are skipped.
 *
 * Usage: node scripts/demo-publish.mjs [clipName ...]   (no arguments = every converted clip)
 *
 * Env (.env): R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, and optionally
 * R2_DEMO_PREFIX (default "portfolio/fit") and CDN_BASE_URL (default "https://cdn.sfivaz.com").
 * Use an R2 API token limited to Object Read & Write on this one bucket.
 */

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const OUT_DIR = path.join(process.cwd(), "demo-output");
/**
 * Short enough that a re-published clip reaches visitors within the hour (the keys don't change),
 * long enough that the CDN serves repeat views from its edge.
 */
const CACHE_CONTROL = "public, max-age=3600";
const CONTENT_TYPES = { ".mp4": "video/mp4", ".webp": "image/webp" };

if (fs.existsSync(".env")) process.loadEnvFile(".env");

function requireEnv(name) {
	const value = process.env[name]?.trim();
	if (!value) {
		console.error(`demo-publish: ${name} is not set. See the R2 section of .env.example.`);
		process.exit(1);
	}
	return value;
}

const accountId = requireEnv("R2_ACCOUNT_ID");
const bucket = requireEnv("R2_BUCKET");
// Match leading or trailing slashes so the prefix joins keys cleanly.
// Matches: the slashes in "/portfolio/fit/"; does not match the inner one in "portfolio/fit".
const prefix = (process.env.R2_DEMO_PREFIX?.trim() || "portfolio/fit").replace(/^\/+|\/+$/g, "");
// Match trailing slashes on the CDN origin, e.g. the "/" in "https://cdn.sfivaz.com/".
const cdnBaseUrl = (process.env.CDN_BASE_URL?.trim() || "https://cdn.sfivaz.com").replace(
	/\/+$/,
	"",
);

const client = new S3Client({
	region: "auto",
	endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
		secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
	},
});

/** The converted files for one clip, as demo-convert writes them. */
function clipFiles(clipName) {
	return [`${clipName}.mp4`, `${clipName}-poster.webp`].map((file) => path.join(OUT_DIR, file));
}

function listClips() {
	const requested = process.argv.slice(2);
	if (requested.length > 0) return requested;
	if (!fs.existsSync(OUT_DIR)) return [];
	return fs
		.readdirSync(OUT_DIR)
		.filter((file) => file.endsWith(".mp4"))
		.map((file) => path.basename(file, ".mp4"));
}

/** R2's ETag for a single-part upload is the MD5 of the body, quoted. */
async function isAlreadyUploaded(key, md5) {
	try {
		const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
		return head.ETag?.replaceAll('"', "") === md5;
	} catch (error) {
		if (error?.$metadata?.httpStatusCode === 404) return false;
		throw error;
	}
}

async function publishFile(file) {
	const body = fs.readFileSync(file);
	const key = `${prefix}/${path.basename(file)}`;
	const url = `${cdnBaseUrl}/${key}`;
	const md5 = createHash("md5").update(body).digest("hex");

	if (await isAlreadyUploaded(key, md5)) {
		console.log(`  unchanged  ${url}`);
		return;
	}
	await client.send(
		new PutObjectCommand({
			Bucket: bucket,
			Key: key,
			Body: body,
			ContentType: CONTENT_TYPES[path.extname(file)],
			CacheControl: CACHE_CONTROL,
		}),
	);
	console.log(`  uploaded   ${url}`);
}

const clips = listClips();
if (clips.length === 0) {
	console.error("demo-publish: no converted clips in demo-output. Run `pnpm demo` first.");
	process.exit(1);
}

let failures = 0;
for (const clip of clips) {
	console.log(clip);
	for (const file of clipFiles(clip)) {
		if (!fs.existsSync(file)) {
			failures += 1;
			console.error(`  missing    ${path.relative(process.cwd(), file)}`);
			continue;
		}
		try {
			await publishFile(file);
		} catch (error) {
			failures += 1;
			// S3 errors describe the failure (e.g. "Access Denied"); they never include the credentials.
			const reason = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
			console.error(`  failed     ${path.basename(file)}: ${reason}`);
		}
	}
}
if (failures > 0) process.exit(1);
