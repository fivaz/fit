import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();

const defaultConfig = {
	enabled: true,
	deviceId: "",
	xcodeProject: "ios/App/App.xcodeproj",
	scheme: "App",
	configuration: "Debug",
	derivedDataPath: "ios/build",
	bundleId: "com.fivaz.fittracker",
	iosDeploy: {
		justLaunch: true,
		uninstall: false,
		timeout: 60,
		noWifi: false,
		verbose: false,
	},
};

function loadJson(filePath) {
	return JSON.parse(readFileSync(filePath, "utf8"));
}

function loadConfig() {
	const localPath = path.join(rootDir, "ios-deploy.config.local.json");
	const configPath = path.join(rootDir, "ios-deploy.config.json");
	const examplePath = path.join(rootDir, "ios-deploy.config.example.json");

	let config = { ...defaultConfig };

	if (existsSync(examplePath)) {
		config = { ...config, ...loadJson(examplePath) };
	}

	if (existsSync(configPath)) {
		config = { ...config, ...loadJson(configPath) };
	} else if (!existsSync(examplePath)) {
		fail(
			"Missing ios-deploy.config.json. Copy ios-deploy.config.example.json to ios-deploy.config.json and set deviceId if needed.",
		);
	}

	if (existsSync(localPath)) {
		config = { ...config, ...loadJson(localPath) };
	}

	config.iosDeploy = { ...defaultConfig.iosDeploy, ...config.iosDeploy };
	return config;
}

function fail(message) {
	console.error(`ios-deploy: ${message}`);
	process.exit(1);
}

function run(command, args, options = {}) {
	const result = spawnSync(command, args, {
		cwd: rootDir,
		stdio: "inherit",
		encoding: "utf8",
		...options,
	});

	if (result.status !== 0) {
		fail(`command failed: ${command} ${args.join(" ")}`);
	}
}

function resolveDeviceId(config) {
	const fromEnv = process.env.IOS_DEPLOY_DEVICE_ID?.trim();
	if (fromEnv) return fromEnv;

	const fromConfig = config.deviceId?.trim();
	if (fromConfig) return fromConfig;

	const detect = spawnSync("ios-deploy", ["-c"], { encoding: "utf8" });
	const output = `${detect.stdout ?? ""}\n${detect.stderr ?? ""}`;
	const match = output.match(/\(([0-9a-fA-F-]{25,})\)/);

	if (match?.[1]) {
		console.log(`ios-deploy: using detected device ${match[1]}`);
		return match[1];
	}

	fail(
		"No deviceId configured and no USB device detected. Set deviceId in ios-deploy.config.json, IOS_DEPLOY_DEVICE_ID, or connect a device and run: ios-deploy -c",
	);
}

function main() {
	if (process.env.IOS_DEPLOY_SKIP === "1") {
		console.log("ios-deploy: skipped (IOS_DEPLOY_SKIP=1)");
		return;
	}

	const config = loadConfig();
	if (!config.enabled) {
		console.log("ios-deploy: skipped (enabled: false in config)");
		return;
	}

	const deviceId = resolveDeviceId(config);
	const projectPath = path.join(rootDir, config.xcodeProject);
	const derivedDataPath = path.join(rootDir, config.derivedDataPath);
	const appBundlePath = path.join(
		derivedDataPath,
		"Build/Products",
		`${config.configuration}-iphoneos`,
		`${config.scheme}.app`,
	);

	if (!existsSync(projectPath)) {
		fail(`Xcode project not found: ${config.xcodeProject}`);
	}

	console.log("ios-deploy: building for device…");
	run("xcodebuild", [
		"-project",
		projectPath,
		"-scheme",
		config.scheme,
		"-configuration",
		config.configuration,
		"-derivedDataPath",
		derivedDataPath,
		"-destination",
		`platform=iOS,id=${deviceId}`,
		"build",
	]);

	if (!existsSync(appBundlePath)) {
		fail(`App bundle not found at ${path.relative(rootDir, appBundlePath)}`);
	}

	const deployArgs = ["--bundle", appBundlePath, "--id", deviceId, "--timeout", String(config.iosDeploy.timeout)];

	if (config.iosDeploy.justLaunch) deployArgs.push("--justlaunch");
	if (config.iosDeploy.uninstall) deployArgs.push("--uninstall");
	if (config.iosDeploy.noWifi) deployArgs.push("--no-wifi");
	if (config.iosDeploy.verbose) deployArgs.push("--verbose");

	console.log(`ios-deploy: installing ${path.relative(rootDir, appBundlePath)}…`);
	run("ios-deploy", deployArgs);

	console.log("ios-deploy: done");
}

main();
