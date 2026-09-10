import { spawn } from "node:child_process";
import process from "node:process";

import { assertCapacitorEnv } from "./assert-capacitor-env.mjs";

function runNextBuild() {
	return new Promise((resolve, reject) => {
		const child = spawn("next", ["build"], {
			stdio: "inherit",
			env: process.env,
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

assertCapacitorEnv();
await runNextBuild();
