import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();

const requiredFiles = [
	"capacitor.config.ts",
	"ios-deploy.config.example.json",
	"scripts/ios-deploy.mjs",
	"ios/App/App.xcodeproj/project.pbxproj",
	"ios/App/App/Info.plist",
	"ios/WorkoutLiveActivityWidget/WorkoutLiveActivityWidgetLiveActivity.swift",
	"ios/WorkoutLiveActivityWidget/GenericAttributes.swift",
	"ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png",
	"ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png",
	"docs/ios-qa-release-checklist.md",
];

const requiredPackageScripts = [
	"generate-ios-assets",
	"ios:build",
	"ios:sync",
	"ios:open",
];

let hasFailures = false;

function pass(message) {
	console.log(`PASS ${message}`);
}

function warn(message) {
	console.warn(`WARN ${message}`);
}

function fail(message) {
	hasFailures = true;
	console.error(`FAIL ${message}`);
}

function run(command, args) {
	return spawnSync(command, args, {
		cwd: rootDir,
		encoding: "utf8",
	});
}

function readPngSize(filePath) {
	const result = run("sips", ["-g", "pixelWidth", "-g", "pixelHeight", filePath]);
	if (result.status !== 0) return null;

	const width = result.stdout.match(/pixelWidth: (\d+)/)?.[1];
	const height = result.stdout.match(/pixelHeight: (\d+)/)?.[1];

	if (!width || !height) return null;
	return {
		width: Number(width),
		height: Number(height),
	};
}

for (const file of requiredFiles) {
	const exists = existsSync(path.join(rootDir, file));
	if (exists) {
		pass(`${file} exists`);
	} else {
		fail(`${file} is missing`);
	}
}

const packageJson = JSON.parse(await readFile(path.join(rootDir, "package.json"), "utf8"));
for (const script of requiredPackageScripts) {
	if (packageJson.scripts?.[script]) {
		pass(`package script ${script} exists`);
	} else {
		fail(`package script ${script} is missing`);
	}
}

const infoPlist = await readFile(path.join(rootDir, "ios/App/App/Info.plist"), "utf8");
for (const key of ["NSSupportsLiveActivities", "NSCameraUsageDescription", "NSPhotoLibraryUsageDescription"]) {
	if (infoPlist.includes(`<key>${key}</key>`)) {
		pass(`Info.plist declares ${key}`);
	} else {
		fail(`Info.plist is missing ${key}`);
	}
}

if (infoPlist.includes("<key>NSAllowsArbitraryLoads</key>\n\t<true/>")) {
	fail("Info.plist enables arbitrary App Transport Security loads");
} else {
	pass("Info.plist does not enable arbitrary App Transport Security loads");
}

const iconSize = readPngSize(
	path.join(rootDir, "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"),
);
if (iconSize?.width === 1024 && iconSize.height === 1024) {
	pass("iOS app icon is 1024x1024");
} else {
	fail("iOS app icon must be 1024x1024");
}

const splashSize = readPngSize(
	path.join(rootDir, "ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png"),
);
if (splashSize?.width === 2732 && splashSize.height === 2732) {
	pass("iOS splash image is 2732x2732");
} else {
	fail("iOS splash image must be 2732x2732");
}

const xcodebuild = run("xcodebuild", ["-version"]);
if (xcodebuild.status === 0) {
	pass(`Xcode is available (${xcodebuild.stdout.split("\n")[0]})`);
} else {
	warn("Xcode is not selected; run this check on a Mac with full Xcode before archiving");
}

if (hasFailures) {
	process.exitCode = 1;
} else {
	console.log("iOS readiness repository checks passed");
}
