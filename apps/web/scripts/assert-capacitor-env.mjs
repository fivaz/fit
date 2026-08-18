import "dotenv/config";

function resolveApiUrl(specific) {
	return specific?.trim() || "http://localhost:3001";
}

function validateHttpUrl(label, value, envKeys) {
	if (!value) {
		return `${label} is required (set ${envKeys.join(" or ")} in .env).`;
	}

	try {
		const parsed = new URL(value);
		if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
			return `${label} must use http:// or https:// (got ${parsed.protocol} from "${value}").`;
		}
	} catch {
		return `${label} is not a valid URL: "${value}".`;
	}

	return null;
}

/**
 * Capacitor loads a static bundle at `capacitor://localhost`; API and auth must target a remote http(s) origin.
 * Values are inlined at `pnpm build:static` / `pnpm ios:build` time.
 */
export function assertCapacitorEnv() {
	const apiBaseUrl = resolveApiUrl(process.env.NEXT_PUBLIC_API_BASE_URL);
	const authBaseUrl = resolveApiUrl(process.env.NEXT_PUBLIC_AUTH_BASE_URL);

	const errors = [
		validateHttpUrl("NEXT_PUBLIC_API_BASE_URL", apiBaseUrl, ["NEXT_PUBLIC_API_BASE_URL"]),
		validateHttpUrl("NEXT_PUBLIC_AUTH_BASE_URL", authBaseUrl, ["NEXT_PUBLIC_AUTH_BASE_URL"]),
	].filter(Boolean);

	if (errors.length === 0) return;

	const message = [
		"[build-static] Capacitor static build requires remote API and auth base URLs.",
		"The iOS WebView origin is capacitor://localhost and cannot call same-origin /api/*.",
		"",
		...errors.map((line) => `- ${line}`),
		"",
		"See .env.example (Capacitor / static bundle) and README.md → Static/mobile (Capacitor) environment.",
	].join("\n");

	throw new Error(message);
}
