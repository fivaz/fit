import { ROUTES } from "@/lib/consts";

type ProgramSearchParams = Pick<URLSearchParams, "get">;

export function readProgramsSelectedId(
	pathname: string,
	searchParams?: ProgramSearchParams,
): string | null {
	if (pathname !== ROUTES.PROGRAMS) return null;
	return searchParams?.get("id")?.trim() || null;
}

/** Cross-route links (e.g. home → program). Uses query params so static/Capacitor builds stay on `/programs`. */
export function programsDetailHref(programId: string): string {
	const params = new URLSearchParams({ id: programId });
	return `${ROUTES.PROGRAMS}?${params.toString()}`;
}

export function isProgramsRoute(pathname: string): boolean {
	return pathname === ROUTES.PROGRAMS;
}

export function pushProgramsSelectedId(programId: string | null): void {
	if (typeof window === "undefined") return;
	const next = programId ? programsDetailHref(programId) : ROUTES.PROGRAMS;
	window.history.pushState({}, "", next);
}
