/**
 * What the app knows about the current sign-in, derived from Better Auth's session query.
 * Only a completed check counts as "signed-out": a slow or failed request (an API cold start, no
 * network) is "unknown", never a reason to sign the user out.
 */
export type SessionStatus = "signed-in" | "signed-out" | "unknown";

export type SessionQueryState = {
	readonly hasSession: boolean;
	readonly isPending: boolean;
	readonly isRefetching: boolean;
	/** HTTP status of the failed get-session request, or 0 when it never got a response. */
	readonly errorStatus: number | null;
	/** Whether the stored bearer token has been loaded and the session re-requested with it. */
	readonly bootstrapReady: boolean;
};

const REJECTED_SESSION_STATUSES = new Set([401, 403]);

export function resolveSessionStatus(state: SessionQueryState): SessionStatus {
	if (state.hasSession) return "signed-in";
	if (state.errorStatus !== null) {
		return REJECTED_SESSION_STATUSES.has(state.errorStatus) ? "signed-out" : "unknown";
	}
	// Before the bootstrap, a null session only means the bearer token wasn't attached yet.
	if (!state.bootstrapReady || state.isPending || state.isRefetching) return "unknown";
	return "signed-out";
}
