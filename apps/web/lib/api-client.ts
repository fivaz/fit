import { resolvePublicApiBaseUrl } from "@/lib/env/mobile-dev-url";
import { getMobileAuthTokenSync, hydrateMobileAuthToken } from "@/lib/mobile/auth-token-store";
import { clientDebug, isClientDebugEnabled } from "@/lib/mobile/client-debug";

type JsonRequestInit = Omit<RequestInit, "body"> & {
	body?: unknown;
};

function resolveApiUrl(input: string): string {
	const baseUrl = resolvePublicApiBaseUrl();
	if (!baseUrl) return input;
	if (!input.startsWith("/")) return input;
	return `${baseUrl.replace(/\/$/, "")}${input}`;
}

export async function apiFetch<T>(input: string, init: JsonRequestInit = {}): Promise<T> {
	if (typeof window !== "undefined") {
		await hydrateMobileAuthToken();
	}

	const headers = new Headers(init.headers);
	const hasBody = init.body !== undefined;
	const method = init.method?.toUpperCase() ?? "GET";

	if (hasBody && !headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}

	const token = getMobileAuthTokenSync();
	if (token && !headers.has("Authorization")) {
		headers.set("Authorization", `Bearer ${token}`);
	}

	const url = resolveApiUrl(input);
	if (isClientDebugEnabled()) {
		clientDebug("apiFetch", "request", {
			method,
			url,
			hasBearer: Boolean(token),
		});
	}

	const response = await fetch(url, {
		...init,
		headers,
		body: hasBody ? JSON.stringify(init.body) : undefined,
		keepalive: init.keepalive ?? (method !== "GET" && method !== "HEAD"),
	});

	if (!response.ok) {
		const errText = await getErrorMessage(response);
		// Capacitor / static bundles almost always set `NEXT_PUBLIC_API_BASE_URL`; surface failures without extra env.
		const logMobileApi = Boolean(resolvePublicApiBaseUrl()) || isClientDebugEnabled();
		if (logMobileApi) {
			console.warn("[FitClient:apiFetch]", {
				method,
				url,
				status: response.status,
				statusText: response.statusText,
				error: errText,
				hasBearer: Boolean(token),
			});
		}
		throw new Error(errText);
	}

	if (isClientDebugEnabled()) {
		clientDebug("apiFetch", "ok", { method, url, status: response.status });
	}

	const text = await response.text();
	if (response.status === 204 || !text) {
		// 204 is the no-content contract. Nest also sends empty 200 when a handler returns null;
		// response.json() throws "Unexpected end of JSON input" on that payload.
		return undefined as T;
	}

	return JSON.parse(text) as T;
}

async function getErrorMessage(response: Response) {
	try {
		const body = (await response.json()) as { error?: string };
		return body.error || `Request failed with status ${response.status}`;
	} catch {
		return `Request failed with status ${response.status}`;
	}
}
