/** Public origin of the Capacitor live-reload URL (HTTPS tunnel or LAN Next). */
export function mobileDevOriginFromEnv(): string | null {
	const raw = process.env.MOBILE_DEV_URL?.trim() || process.env.CAPACITOR_SERVER_URL?.trim();
	if (!raw) return null;
	try {
		return new URL(raw).origin;
	} catch {
		return null;
	}
}
