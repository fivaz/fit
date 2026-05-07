import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, rename } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const buildTmpDir = path.resolve(".static-build-tmp");
const appApiDir = path.resolve("app/api");
const appApiBackupDir = path.resolve(".static-build-tmp/app-api");
const e2eDistDir = path.resolve(".next-e2e-dev");
const e2eDistBackupDir = path.resolve(".static-build-tmp/next-e2e-dev");

async function ensureTmpDir() {
	await mkdir(buildTmpDir, { recursive: true });
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

async function moveE2eDistOutOfBuild() {
	if (!existsSync(e2eDistDir)) return false;
	await ensureTmpDir();
	if (existsSync(e2eDistBackupDir)) {
		throw new Error(
			`Cannot run static build because E2E backup directory already exists: ${e2eDistBackupDir}`,
		);
	}
	await rename(e2eDistDir, e2eDistBackupDir);
	return true;
}

async function restoreE2eDist(moved) {
	if (!moved) return;
	if (existsSync(e2eDistDir)) {
		throw new Error(`Cannot restore E2E dist directory because destination exists: ${e2eDistDir}`);
	}
	await rename(e2eDistBackupDir, e2eDistDir);
}

let movedApiRoutes = false;
let movedE2eDist = false;

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
	movedApiRoutes = await moveApiRoutesOutOfBuild();
	movedE2eDist = await moveE2eDistOutOfBuild();
	await runNextBuild();
} finally {
	await Promise.all([restoreApiRoutes(movedApiRoutes), restoreE2eDist(movedE2eDist)]);
}
