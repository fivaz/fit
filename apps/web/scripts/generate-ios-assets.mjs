import { spawn } from "node:child_process";
import { cp, mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const iconSize = 1024;
const splashSize = 2732;
const splashGlyphSize = 768;
const splashBackgroundColor = "ffffff";

const rootDir = process.cwd();
const sourceSvg = path.join(rootDir, "public/favicon.svg");
const appIconPath = path.join(
	rootDir,
	"ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png",
);
const splashPaths = [
	path.join(rootDir, "ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png"),
	path.join(rootDir, "ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-1.png"),
	path.join(rootDir, "ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-2.png"),
];

function run(command, args) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args);
		let output = "";

		child.stdout.on("data", (chunk) => {
			output += chunk;
		});

		child.stderr.on("data", (chunk) => {
			output += chunk;
		});

		child.on("error", reject);
		child.on("exit", (code) => {
			if (code === 0) {
				resolve();
				return;
			}
			reject(
				new Error(
					`${command} ${args.join(" ")} failed with exit code ${code ?? "unknown"}\n${output}`,
				),
			);
		});
	});
}

async function rasterizeSvg(size, outputPath) {
	const tmpDir = await mkdtemp(path.join(os.tmpdir(), "fit-ios-assets-"));

	try {
		await run("qlmanage", ["-t", "-s", String(size), "-o", tmpDir, sourceSvg]);
		const rasterizedPath = path.join(tmpDir, "favicon.svg.png");
		await cp(rasterizedPath, outputPath);
	} finally {
		await rm(tmpDir, { recursive: true, force: true });
	}
}

async function generateSplash(outputPath) {
	await rasterizeSvg(splashGlyphSize, outputPath);
	await run("sips", [
		"--padToHeightWidth",
		String(splashSize),
		String(splashSize),
		"--padColor",
		splashBackgroundColor,
		outputPath,
	]);
}

await rasterizeSvg(iconSize, appIconPath);

for (const splashPath of splashPaths) {
	await generateSplash(splashPath);
}

console.log("Generated iOS assets from public/favicon.svg");
