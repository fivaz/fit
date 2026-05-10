type JsonRequestInit = Omit<RequestInit, "body"> & {
	body?: unknown;
};

function resolveApiUrl(input: string): string {
	const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
	if (!baseUrl) return input;
	if (!input.startsWith("/")) return input;
	return `${baseUrl.replace(/\/$/, "")}${input}`;
}

export async function apiFetch<T>(input: string, init: JsonRequestInit = {}): Promise<T> {
	const headers = new Headers(init.headers);
	const hasBody = init.body !== undefined;
	const method = init.method?.toUpperCase() ?? "GET";

	if (hasBody && !headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}

	const response = await fetch(resolveApiUrl(input), {
		...init,
		headers,
		body: hasBody ? JSON.stringify(init.body) : undefined,
		keepalive: init.keepalive ?? (method !== "GET" && method !== "HEAD"),
	});

	if (!response.ok) {
		throw new Error(await getErrorMessage(response));
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return response.json() as Promise<T>;
}

async function getErrorMessage(response: Response) {
	try {
		const body = (await response.json()) as { error?: string };
		return body.error || `Request failed with status ${response.status}`;
	} catch {
		return `Request failed with status ${response.status}`;
	}
}
