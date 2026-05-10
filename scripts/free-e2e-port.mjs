import { execSync } from "node:child_process";
import process from "node:process";

/**
 * Stops whatever is listening on the E2E dev port so Playwright can start `next dev`.
 * `pnpm test` / `pnpm run test:e2e` run this before Playwright; raw `pnpm exec playwright test` does not.
 */
const port = process.env.E2E_DEV_PORT ?? "3000";

if (process.platform === "win32") {
	console.warn(
		`free-e2e-port: skipped on Windows — close anything using port ${port} before running E2E.`,
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
	console.log(`free-e2e-port: freed port ${port} (PIDs: ${pids.join(", ")})`);
}
