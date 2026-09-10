#!/usr/bin/env node
/**
 * Build the iOS app with xcodebuild and install on a connected device.
 *
 * Wireless (no USB): pair the iPhone in Xcode → Window → Devices and Simulators,
 * enable "Connect via network", then run with USB unplugged. Detection uses
 * `devicectl` (same stack as Xcode); install uses `devicectl device install app`
 * with ios-deploy as fallback.
 *
 * Config: ios-deploy.config.json (see ios-deploy.config.example.json)
 * Env: IOS_DEPLOY_DEVICE_ID, IOS_DEPLOY_REQUIRED=1
 */

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

const DEFAULT_CONFIG = {
	enabled: true,
	deviceId: "",
	preferWireless: true,
	installTool: "auto",
	xcodeProject: "ios/App/App.xcodeproj",
	scheme: "App",
	configuration: "Debug",
	derivedDataPath: "ios/build",
	bundleId: "com.fivaz.fittracker",
	iosDeploy: {
		justLaunch: false,
		noStart: false,
		uninstall: false,
		timeout: 60,
		noWifi: false,
		usbOnly: false,
		verbose: false,
	},
};

function loadConfig() {
	const configPath = join(rootDir, "ios-deploy.config.json");
	if (!existsSync(configPath)) {
		return { ...DEFAULT_CONFIG };
	}
	try {
		const raw = JSON.parse(readFileSync(configPath, "utf8"));
		return {
			...DEFAULT_CONFIG,
			...raw,
			iosDeploy: { ...DEFAULT_CONFIG.iosDeploy, ...raw.iosDeploy },
		};
	} catch (err) {
		console.error("ios-deploy: invalid ios-deploy.config.json:", err.message);
		process.exit(1);
	}
}

function run(command, args, options = {}) {
	const result = spawnSync(command, args, {
		encoding: "utf8",
		cwd: rootDir,
		...options,
	});
	return result;
}

/** @typedef {{ udid: string, coreDeviceId: string, name: string, transport: string, tunnelState: string }} DevicectlPhone */

/** @returns {DevicectlPhone[]} */
function listDevicectlPhones() {
	const jsonPath = join(rootDir, ".ios-deploy-devicectl.json");
	const result = run("xcrun", [
		"devicectl",
		"list",
		"devices",
		"--json-output",
		jsonPath,
	]);
	try {
		if (result.status !== 0 || !existsSync(jsonPath)) {
			return [];
		}
		const data = JSON.parse(readFileSync(jsonPath, "utf8"));
		const devices = data.result?.devices ?? [];
		return devices
			.filter(
				(d) =>
					d.hardwareProperties?.platform === "iOS" &&
					d.hardwareProperties?.reality === "physical" &&
					d.connectionProperties?.pairingState === "paired" &&
					d.hardwareProperties?.udid,
			)
			.map((d) => ({
				udid: d.hardwareProperties.udid,
				coreDeviceId: d.identifier,
				name: d.deviceProperties?.name ?? "iPhone",
				transport: d.connectionProperties?.transportType ?? "unknown",
				tunnelState: d.connectionProperties?.tunnelState ?? "unknown",
			}));
	} catch {
		return [];
	} finally {
		try {
			rmSync(jsonPath, { force: true });
		} catch {
			/* ignore */
		}
	}
}

/** @returns {{ udid: string, connection: string }[]} */
function listIosDeployDevices() {
	const args = ["-c"];
	if (config.iosDeploy?.usbOnly || config.iosDeploy?.noWifi) {
		args.push("--no-wifi");
	}
	const result = run("ios-deploy", args);
	if (result.status !== 0) {
		return [];
	}
	const devices = [];
	const re =
		/Found\s+([0-9a-fA-F-]+)\s+.*?connected through\s+([A-Za-z0-9\s]+)/gi;
	let match;
	const text = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
	while ((match = re.exec(text)) !== null) {
		const connection = match[2].trim().replace(/\s+/g, " ");
		devices.push({ udid: match[1], connection });
	}
	return devices;
}

let config = loadConfig();

function transportRank(transport, preferWireless) {
	if (!preferWireless) return 0;
	if (transport === "localNetwork") return 0;
	if (transport === "wired") return 1;
	return 2;
}

function connectionRank(connection, preferWireless) {
	if (!preferWireless) return 0;
	const lower = connection.toLowerCase();
	if (lower.includes("wifi") || lower.includes("network")) return 0;
	if (lower.includes("usb")) return 1;
	return 2;
}

/**
 * @param {DevicectlPhone[]} phones
 * @param {string | undefined} explicitId
 */
function pickDevicectlPhone(phones, explicitId) {
	if (phones.length === 0) return null;

	if (explicitId) {
		const match = phones.find(
			(p) => p.udid === explicitId || p.coreDeviceId === explicitId,
		);
		if (match) return match;
		console.warn(
			`ios-deploy: deviceId ${explicitId} not in devicectl list; using configured id anyway.`,
		);
		return null;
	}

	const preferWireless = config.preferWireless !== false;
	const sorted = [...phones].sort((a, b) => {
		const byTransport =
			transportRank(a.transport, preferWireless) -
			transportRank(b.transport, preferWireless);
		if (byTransport !== 0) return byTransport;
		const aConnected = a.tunnelState === "connected" ? 0 : 1;
		const bConnected = b.tunnelState === "connected" ? 0 : 1;
		return aConnected - bConnected;
	});
	return sorted[0];
}

/**
 * @returns {{ deviceId: string, coreDeviceId?: string, name?: string, transportLabel: string } | null}
 */
function resolveDeployTarget() {
	const explicit =
		process.env.IOS_DEPLOY_DEVICE_ID?.trim() || config.deviceId?.trim();

	const phones = listDevicectlPhones();
	const picked = pickDevicectlPhone(phones, explicit || undefined);

	if (picked) {
		const via =
			picked.transport === "localNetwork"
				? "Wi‑Fi (network)"
				: picked.transport === "wired"
					? "USB"
					: picked.transport;
		console.log(
			`ios-deploy: ${picked.name} (${picked.udid}) — ${via}, tunnel ${picked.tunnelState}`,
		);
		return {
			deviceId: picked.udid,
			coreDeviceId: picked.coreDeviceId,
			name: picked.name,
			transportLabel: via,
		};
	}

	if (explicit) {
		return {
			deviceId: explicit,
			transportLabel: "configured device id",
		};
	}

	const iosDeployDevices = listIosDeployDevices();
	if (iosDeployDevices.length > 0) {
		const preferWireless = config.preferWireless !== false;
		const sorted = [...iosDeployDevices].sort(
			(a, b) =>
				connectionRank(a.connection, preferWireless) -
				connectionRank(b.connection, preferWireless),
		);
		const d = sorted[0];
		console.log(
			`ios-deploy: using ${d.udid} (${d.connection}) via ios-deploy`,
		);
		return {
			deviceId: d.udid,
			transportLabel: d.connection,
		};
	}

	return null;
}

function skipDeployNoDevice() {
	const required = process.env.IOS_DEPLOY_REQUIRED === "1";
	const msg = [
		"ios-deploy: no iPhone found.",
		"For wireless: Xcode → Window → Devices and Simulators → select your iPhone →",
		'check "Connect via network" (pair once over USB if needed), then unplug USB.',
		"Set deviceId in ios-deploy.config.json or IOS_DEPLOY_DEVICE_ID.",
	];
	if (required) {
		console.error(msg.join("\n"));
		process.exit(1);
	}
	console.warn(`${msg.join("\n")}\nSkipping deploy (build artifacts are ready).`);
	process.exit(0);
}

function findBuiltApp(derivedDataPath, configuration) {
	const base = join(rootDir, derivedDataPath, "Build", "Products");
	const debugDir = join(base, `${configuration}-iphoneos`);
	const appName = "App.app";
	const direct = join(debugDir, appName);
	if (existsSync(direct)) return direct;

	const entries = existsSync(base) ? readdirSync(base) : [];
	for (const entry of entries) {
		const candidate = join(base, entry, appName);
		if (existsSync(candidate)) return candidate;
	}
	return null;
}

function runXcodeBuild(target) {
	const derivedDataPath = join(rootDir, config.derivedDataPath);
	const projectPath = join(rootDir, config.xcodeProject);
	const destination = `platform=iOS,id=${target.deviceId}`;

	console.log("ios-deploy: xcodebuild…");
	const result = run(
		"xcodebuild",
		[
			"-project",
			projectPath,
			"-scheme",
			config.scheme,
			"-configuration",
			config.configuration,
			"-destination",
			destination,
			"-derivedDataPath",
			derivedDataPath,
			"build",
		],
		{ stdio: "inherit" },
	);

	if (result.status !== 0) {
		console.error("ios-deploy: xcodebuild failed.");
		process.exit(result.status ?? 1);
	}
}

function runDevicectlLaunch(deviceRef, bundleId, timeoutSec) {
	console.log("ios-deploy: launching app via devicectl…");
	const args = [
		"devicectl",
		"device",
		"process",
		"launch",
		"--device",
		deviceRef,
		bundleId,
	];
	if (timeoutSec > 0) {
		args.push("--timeout", String(timeoutSec));
	}
	const result = run("xcrun", args, { stdio: "inherit" });
	return result.status === 0;
}

function runDevicectlInstall(deviceRef, appPath, timeoutSec) {
	console.log("ios-deploy: installing via devicectl (Xcode wireless stack)…");
	const args = [
		"devicectl",
		"device",
		"install",
		"app",
		"--device",
		deviceRef,
		appPath,
	];
	if (timeoutSec > 0) {
		args.push("--timeout", String(timeoutSec));
	}
	const result = run("xcrun", args, { stdio: "inherit" });
	return result.status === 0;
}

function runIosDeployInstall(target, appPath) {
	const ios = config.iosDeploy;
	const args = ["--id", target.deviceId, "--bundle", appPath];

	if (ios.justLaunch) {
		args.push("--justlaunch");
	}
	if (ios.noStart) {
		args.push("--nostart");
	}
	if (ios.uninstall) {
		args.push("--uninstall");
	}
	if (ios.timeout) {
		args.push("--timeout", String(ios.timeout));
	}
	if (ios.noWifi || ios.usbOnly) {
		args.push("--no-wifi");
	}
	if (ios.verbose) {
		args.push("--verbose");
	}

	console.log("ios-deploy: installing via ios-deploy…");
	const result = run("ios-deploy", args, { stdio: "inherit" });
	return result;
}

function installApp(target, appPath) {
	const tool = config.installTool ?? "auto";
	const timeout = config.iosDeploy?.timeout ?? 120;
	const deviceRef = target.deviceId;

	if (tool === "devicectl" || tool === "auto") {
		const ok = runDevicectlInstall(deviceRef, appPath, timeout);
		if (ok) {
			console.log("ios-deploy: install succeeded (devicectl).");
			if (config.iosDeploy?.noStart) {
				console.log(
					"ios-deploy: app installed; open it on your iPhone (install-only mode).",
				);
			} else {
				const launched = runDevicectlLaunch(
					deviceRef,
					config.bundleId,
					timeout,
				);
				if (launched) {
					console.log("ios-deploy: app launched.");
				} else {
					console.warn(
						"ios-deploy: install OK but launch failed — open the app on your iPhone.",
					);
				}
			}
			return;
		}
		if (tool === "devicectl") {
			console.error("ios-deploy: devicectl install failed.");
			process.exit(1);
		}
		console.warn("ios-deploy: devicectl failed; trying ios-deploy…");
	}

	const result = runIosDeployInstall(target, appPath);
	const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
	const installOk =
		result.status === 0 ||
		/\[.*%\].*InstallComplete|Installed package/i.test(combined);
	const launchFailed =
		/DeveloperDiskImage|launch failed|Could not locate device support/i.test(
			combined,
		);

	if (installOk && launchFailed && config.iosDeploy?.noStart) {
		console.warn(
			"ios-deploy: app installed; launch step failed (open the app on your iPhone).",
		);
		return;
	}

	if (result.status !== 0 && !installOk) {
		console.error("ios-deploy: install failed.");
		process.exit(result.status ?? 1);
	}

	console.log("ios-deploy: done.");
}

// --- main ---
config = loadConfig();

if (!config.enabled) {
	console.log("ios-deploy: disabled in ios-deploy.config.json");
	process.exit(0);
}

const target = resolveDeployTarget();
if (!target) {
	skipDeployNoDevice();
}

runXcodeBuild(target);

const appPath = findBuiltApp(config.derivedDataPath, config.configuration);
if (!appPath) {
	console.error(
		`ios-deploy: could not find App.app under ${config.derivedDataPath}/Build/Products`,
	);
	process.exit(1);
}

console.log(`ios-deploy: ${appPath}`);
installApp(target, appPath);
