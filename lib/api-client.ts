type JsonRequestInit = Omit<RequestInit, "body"> & {
	body?: unknown;
};

export async function apiFetch<T>(input: string, init: JsonRequestInit = {}): Promise<T> {
	const headers = new Headers(init.headers);
	const hasBody = init.body !== undefined;

	if (hasBody && !headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}

	const response = await fetch(input, {
		...init,
		headers,
		body: hasBody ? JSON.stringify(init.body) : undefined,
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
