#!/usr/bin/env node
/**
 * Converts the raw Playwright recordings in demo-output/raw/*.webm into portfolio-ready files in
 * demo-output/: <clip>.mp4 (H.264), <clip>.webm (VP9) and <clip>-poster.webp. Requires ffmpeg.
 *
 * Usage: node scripts/demo-convert.mjs [clipName ...]   (no arguments = every raw clip)
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const RAW_DIR = path.join(process.cwd(), "demo-output", "raw");
const OUT_DIR = path.join(process.cwd(), "demo-output");
const MAX_BYTES = 1.5 * 1024 * 1024;

/**
 * Seconds of dead time to cut per clip. `start` drops the blank/loading frames at the beginning of
 * a recording; `end` drops the idle tail. Tune after watching the raw video.
 */
const TRIMS = {
	"flow-workout": { start: 0.5, end: 0.3 },
	"flow-generate": { start: 0.5, end: 0.3 },
	"flow-credits": { start: 0.5, end: 0.3 },
};
const DEFAULT_TRIM = { start: 0.5, end: 0.3 };

function run(command, args) {
	return spawnSync(command, args, { encoding: "utf8" });
}

function requireFfmpeg() {
	const ffmpeg = run("ffmpeg", ["-version"]);
	const ffprobe = run("ffprobe", ["-version"]);
	if (ffmpeg.error || ffmpeg.status !== 0 || ffprobe.error || ffprobe.status !== 0) {
		console.error(
			"demo-convert: ffmpeg and ffprobe are required but were not found on PATH.\n" +
				"Install them (macOS: `brew install ffmpeg`, Debian/Ubuntu: `sudo apt install ffmpeg`) and re-run.",
		);
		process.exit(1);
	}
}

function durationSeconds(file) {
	const probe = run("ffprobe", [
		"-v",
		"error",
		"-show_entries",
		"format=duration",
		"-of",
		"default=noprint_wrappers=1:nokey=1",
		file,
	]);
	const value = Number.parseFloat(probe.stdout);
	if (Number.isNaN(value)) throw new Error(`Could not read the duration of ${file}`);
	return value;
}

function ffmpeg(args) {
	const result = run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", ...args]);
	if (result.status !== 0) {
		throw new Error(`ffmpeg failed: ${result.stderr || result.stdout}`);
	}
}

/** Re-encodes with progressively higher CRF until the file fits the size budget (or 3 tries). */
function encodeWithinBudget(label, baseCrf, buildArgs, outFile) {
	let crf = baseCrf;
	for (let attempt = 0; attempt < 3; attempt += 1) {
		ffmpeg(buildArgs(crf));
		const { size } = fs.statSync(outFile);
		if (size <= MAX_BYTES) return size;
		console.warn(`  ${label}: ${formatSize(size)} at CRF ${crf}, over budget; raising CRF`);
		crf += 4;
	}
	return fs.statSync(outFile).size;
}

/**
 * Writes a WebP poster. Not every ffmpeg build ships the libwebp encoder, so fall back to extracting
 * a PNG and converting it with cwebp; as a last resort keep the PNG (and say so) instead of failing.
 */
function writePoster(input, atSeconds, posterWebp) {
	const seek = ["-ss", String(atSeconds), "-i", input, "-frames:v", "1"];
	const direct = run("ffmpeg", [
		"-y",
		"-hide_banner",
		"-loglevel",
		"error",
		...seek,
		"-c:v",
		"libwebp",
		"-quality",
		"82",
		posterWebp,
	]);
	if (direct.status === 0) return posterWebp;

	const png = posterWebp.replace(/\.webp$/, ".png");
	ffmpeg([...seek, png]);
	const cwebp = run("cwebp", ["-q", "82", png, "-o", posterWebp]);
	if (cwebp.status === 0) {
		fs.rmSync(png);
		return posterWebp;
	}
	console.warn(
		"  poster: neither ffmpeg's libwebp nor cwebp is available; keeping a PNG poster instead.",
	);
	return png;
}

function formatSize(bytes) {
	return bytes >= 1024 * 1024
		? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
		: `${(bytes / 1024).toFixed(0)} KB`;
}

/**
 * Stretches of dead time recorded by a clip (e.g. waiting on OpenAI), as [from, to] seconds on the
 * raw timeline, written by the demo through its `timeline` fixture.
 */
function readCuts(clipName) {
	const file = path.join(RAW_DIR, `${clipName}.cuts.json`);
	return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : [];
}

/** The [start, end] pieces of the raw timeline to keep, after the edge trims and the cuts. */
function keepSegments(total, trim, cuts) {
	let segments = [[trim.start, total - trim.end]];
	for (const cut of [...cuts].sort((a, b) => a.from - b.from)) {
		segments = segments.flatMap(([from, to]) => {
			if (cut.to <= from || cut.from >= to) return [[from, to]];
			return [
				[from, Math.max(from, cut.from)],
				[Math.min(to, cut.to), to],
			].filter(([a, b]) => b - a > 0.05);
		});
	}
	return segments;
}

function convertClip(clipName) {
	const input = path.join(RAW_DIR, `${clipName}.webm`);
	const trim = TRIMS[clipName] ?? DEFAULT_TRIM;
	const total = durationSeconds(input);
	const segments = keepSegments(total, trim, readCuts(clipName));
	const length = segments.reduce((sum, [from, to]) => sum + (to - from), 0);
	if (length <= 0)
		throw new Error(
			`${clipName}: trims (${trim.start}s + ${trim.end}s) exceed ${total.toFixed(1)}s`,
		);

	// Trim each kept piece, join them, then scale. Playwright records at CSS-pixel size (393x852),
	// so upscale 2x for retina displays; that also gives the even dimensions both encoders need.
	const pieces = segments
		.map(
			([from, to], i) =>
				`[0:v]trim=start=${from.toFixed(3)}:end=${to.toFixed(3)},setpts=PTS-STARTPTS[p${i}]`,
		)
		.join(";");
	const joined =
		segments.map((_, i) => `[p${i}]`).join("") + `concat=n=${segments.length}:v=1:a=0[joined]`;
	const filter = `${pieces};${joined};[joined]scale=iw*2:ih*2:flags=lanczos[out]`;
	const window = ["-i", input, "-filter_complex", filter, "-map", "[out]"];
	const mp4 = path.join(OUT_DIR, `${clipName}.mp4`);
	const webm = path.join(OUT_DIR, `${clipName}.webm`);
	const poster = path.join(OUT_DIR, `${clipName}-poster.webp`);

	console.log(
		`${clipName}: ${total.toFixed(1)}s raw -> ${length.toFixed(1)}s` +
			(segments.length > 1 ? ` (${segments.length - 1} cut)` : ""),
	);

	const sizes = {
		mp4: encodeWithinBudget(
			"mp4",
			28,
			(crf) => [
				...window,
				"-c:v",
				"libx264",
				"-preset",
				"slow",
				"-crf",
				String(crf),
				"-pix_fmt",
				"yuv420p",
				"-movflags",
				"+faststart",
				"-an",
				mp4,
			],
			mp4,
		),
		webm: encodeWithinBudget(
			"webm",
			38,
			(crf) => [
				...window,
				"-c:v",
				"libvpx-vp9",
				"-crf",
				String(crf),
				"-b:v",
				"0",
				"-row-mt",
				"1",
				"-an",
				webm,
			],
			webm,
		),
	};

	// First meaningful frame: just after the trimmed start, once the screen has painted.
	const posterFile = writePoster(input, segments[0][0] + 0.2, poster);
	sizes[path.basename(posterFile)] = fs.statSync(posterFile).size;

	for (const [kind, size] of Object.entries(sizes)) {
		const flag = size > MAX_BYTES ? "  (over 1.5 MB budget)" : "";
		// Encoded videos are keyed by extension ("mp4"); the poster is keyed by its full file name.
		const name = kind.includes(".") ? kind : `${clipName}.${kind}`;
		console.log(`  ${name}: ${formatSize(size)}${flag}`);
	}
}

requireFfmpeg();

if (!fs.existsSync(RAW_DIR)) {
	console.error(`demo-convert: no raw recordings at ${RAW_DIR}. Run \`pnpm demo:record\` first.`);
	process.exit(1);
}

const requested = process.argv.slice(2);
const clips =
	requested.length > 0
		? requested
		: fs
				.readdirSync(RAW_DIR)
				.filter((file) => file.endsWith(".webm"))
				.map((file) => path.basename(file, ".webm"));

if (clips.length === 0) {
	console.error("demo-convert: demo-output/raw has no .webm files.");
	process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
let failures = 0;
for (const clip of clips) {
	try {
		convertClip(clip);
	} catch (error) {
		failures += 1;
		console.error(`  ${clip}: ${error instanceof Error ? error.message : error}`);
	}
}
if (failures > 0) process.exit(1);
