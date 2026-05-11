import { execSync } from "node:child_process";
import process from "node:process";

/**
 * Stops whatever is listening on the default Next dev port so you can start a fresh `next dev`.
 * Used before E2E (Playwright starts its own dev server) or any workflow that needs port 3000 free.
 */
const port = process.env.DEV_SERVER_PORT ?? process.env.E2E_DEV_PORT ?? "3000";

if (process.platform === "win32") {
	console.warn(
		`free-dev-server-port: skipped on Windows — close anything using port ${port} before starting the dev server.`,
	);
	process.exit(0);
}

let stdout;
try {
	stdout = execSync(`lsof -ti:${port}`, { encoding: "utf8" });
} catch {
	process.exit(0);
}

const pids = stdout
	.trim()
	.split(/\s+/)
	.filter(Boolean);

for (const pid of pids) {
	try {
		process.kill(Number(pid), "SIGKILL");
	} catch {
		// Process may have exited or require elevated permissions.
	}
}

if (pids.length) {
	console.log(`free-dev-server-port: freed port ${port} (PIDs: ${pids.join(", ")})`);
}
