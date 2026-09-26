/**
 * Whether the API is answering, as seen by the app's own requests. Drives the small status dot:
 * - "starting": nothing has answered yet since launch, or a request is taking long (a scaled-to-zero
 *   container booting). Changes are kept on the device meanwhile.
 * - "online": the last request got an answer (any HTTP status the API itself produced).
 * - "unreachable": no network, or the gateway says the API is down; the app works from saved data.
 */
export type ApiStatus = "starting" | "online" | "unreachable";

/** A request still pending after this long means the API is (re)starting. */
const SLOW_REQUEST_MS = 3_000;
/** Returned by Azure's gateway (not the API) when no healthy container can take the request. */
const API_DOWN_STATUSES = new Set([502, 503, 504]);

let status: ApiStatus = "starting";
const listeners = new Set<() => void>();

function setApiStatus(next: ApiStatus): void {
	if (next === status) return;
	status = next;
	for (const listener of listeners) listener();
}

export function getApiStatus(): ApiStatus {
	return status;
}

export function subscribeToApiStatus(listener: () => void): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

/** The device reported losing its connection; requests would fail until it comes back. */
export function markApiUnreachable(): void {
	setApiStatus("unreachable");
}

/** Runs one API request and updates the status from how it went. */
export async function trackApiRequest(request: () => Promise<Response>): Promise<Response> {
	// After a failure, a new attempt means "reconnecting", which reads as starting.
	if (status === "unreachable") setApiStatus("starting");
	const slowTimer = setTimeout(() => setApiStatus("starting"), SLOW_REQUEST_MS);
	try {
		const response = await request();
		setApiStatus(API_DOWN_STATUSES.has(response.status) ? "unreachable" : "online");
		return response;
	} catch (error) {
		setApiStatus("unreachable");
		throw error;
	} finally {
		clearTimeout(slowTimer);
	}
}
