import { createPrivateKey, sign } from "node:crypto";

const APPLE_AUDIENCE = "https://appleid.apple.com";
// Apple rejects client secrets that live longer than 6 months.
const CLIENT_SECRET_LIFETIME_SECONDS = 60 * 60 * 24 * 180;

type AppleClientSecretParams = {
	teamId: string;
	keyId: string;
	/** Services ID (web flow) — the `sub` claim Apple expects. */
	clientId: string;
	/** Contents of the `.p8` key; literal `\n` sequences are accepted for single-line env vars. */
	privateKey: string;
};

function base64Url(input: Buffer | string): string {
	return Buffer.from(input).toString("base64url");
}

/**
 * Apple has no static client secret: it must be an ES256-signed JWT built from the
 * team's Sign in with Apple private key.
 */
export function createAppleClientSecret({
	teamId,
	keyId,
	clientId,
	privateKey,
}: AppleClientSecretParams): string {
	const issuedAt = Math.floor(Date.now() / 1000);
	const header = { alg: "ES256", kid: keyId };
	const payload = {
		iss: teamId,
		iat: issuedAt,
		exp: issuedAt + CLIENT_SECRET_LIFETIME_SECONDS,
		aud: APPLE_AUDIENCE,
		sub: clientId,
	};
	const signingInput = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(payload))}`;

	// Match a literal backslash followed by "n" (how a multi-line PEM is flattened into one env var line).
	// Matches: "-----BEGIN PRIVATE KEY-----\nMIGT..."
	// Does not match: a PEM that already contains real newlines
	const escapedNewlineRegex = /\\n/g;
	const key = createPrivateKey(privateKey.replace(escapedNewlineRegex, "\n"));
	// JWT ES256 signatures are the raw r||s form, not Node's default DER encoding.
	const signature = sign("sha256", Buffer.from(signingInput), {
		key,
		dsaEncoding: "ieee-p1363",
	});

	return `${signingInput}.${base64Url(signature)}`;
}
