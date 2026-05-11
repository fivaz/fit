import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const buildTmpDir = path.resolve(".static-build-tmp");
const appApiDir = path.resolve("app/api");
const appApiBackupDir = path.resolve(".static-build-tmp/app-api");
async function ensureTmpDir() {
	await mkdir(buildTmpDir, { recursive: true });
}

/**
 * If a previous run was killed after moving `app/api` away, the backup is left behind.
 * Restore `app/api` when it is missing, or drop a stale backup when `app/api` already exists.
 */
async function reconcileStaleApiBackup() {
	if (!existsSync(appApiBackupDir)) return;
	if (!existsSync(appApiDir)) {
		console.warn(
			`[build-static] Restoring app/api from interrupted build backup at ${appApiBackupDir}`,
		);
		await rename(appApiBackupDir, appApiDir);
		return;
	}
	console.warn(
		`[build-static] Removing stale API backup (app/api already present): ${appApiBackupDir}`,
	);
	await rm(appApiBackupDir, { recursive: true, force: true });
}

async function moveApiRoutesOutOfBuild() {
	if (!existsSync(appApiDir)) return false;
	await ensureTmpDir();
	if (existsSync(appApiBackupDir)) {
		throw new Error(
			`Cannot run static build because backup directory already exists: ${appApiBackupDir}`,
		);
	}
	await rename(appApiDir, appApiBackupDir);
	return true;
}

async function restoreApiRoutes(moved) {
	if (!moved) return;
	if (existsSync(appApiDir)) {
		throw new Error(
			`Cannot restore API routes because destination already exists: ${appApiDir}`,
		);
	}
	await rename(appApiBackupDir, appApiDir);
}

let movedApiRoutes = false;

function runNextBuild() {
	return new Promise((resolve, reject) => {
		const child = spawn("next", ["build"], {
			stdio: "inherit",
			env: {
				...process.env,
				NEXT_BUILD_TARGET: "static",
				NEXT_DIST_DIR: ".next-static",
			},
			shell: process.platform === "win32",
		});

		child.on("error", reject);
		child.on("exit", (code) => {
			if (code === 0) {
				resolve();
				return;
			}
			reject(new Error(`Static build failed with exit code ${code ?? "unknown"}`));
		});
	});
}

try {
	await reconcileStaleApiBackup();
	movedApiRoutes = await moveApiRoutesOutOfBuild();
	await runNextBuild();
} finally {
	await restoreApiRoutes(movedApiRoutes);
}
