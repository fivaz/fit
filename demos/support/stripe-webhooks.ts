import { type ChildProcess, spawn } from "node:child_process";

const WEBHOOK_URL = "http://localhost:3001/api/billing/webhook";
const READY_TIMEOUT_MS = 20_000;

/**
 * Forwards Stripe test-mode webhooks to the local API with the Stripe CLI, so a completed Checkout
 * actually credits the account. The API verifies signatures with STRIPE_WEBHOOK_SECRET, which must
 * be the secret `stripe listen` prints for this machine. Resolves once the CLI is forwarding.
 */
export async function startStripeWebhookForwarding(): Promise<() => void> {
	const listener: ChildProcess = spawn(
		"stripe",
		["listen", "--events", "checkout.session.completed", "--forward-to", WEBHOOK_URL],
		{ stdio: ["ignore", "pipe", "pipe"] },
	);
	const stop = () => {
		listener.kill();
	};

	await new Promise<void>((resolve, reject) => {
		const timer = setTimeout(() => {
			stop();
			reject(new Error("`stripe listen` did not become ready. Run `stripe login` and retry."));
		}, READY_TIMEOUT_MS);
		// The CLI reports readiness on stderr ("Ready! ... Your webhook signing secret is ...").
		// Only look for the word; the rest of the line holds the secret and isn't read or logged.
		listener.stderr?.on("data", (chunk: Buffer) => {
			if (chunk.toString().includes("Ready!")) {
				clearTimeout(timer);
				resolve();
			}
		});
		listener.on("error", (error) => {
			clearTimeout(timer);
			reject(new Error(`Could not start the Stripe CLI (is it installed?): ${error.message}`));
		});
	});

	return stop;
}
