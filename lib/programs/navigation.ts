import { ROUTES } from "@/lib/consts";

type ProgramSearchParams = Pick<URLSearchParams, "get">;

export function readProgramsSelectedId(
	pathname: string,
	searchParams?: ProgramSearchParams,
): string | null {
	const detailPrefix = `${ROUTES.PROGRAMS}/`;
	if (pathname.startsWith(detailPrefix)) {
		const [encodedProgramId] = pathname.slice(detailPrefix.length).split("/");
		if (!encodedProgramId) return null;
		return decodeURIComponent(encodedProgramId).trim() || null;
	}

	return searchParams?.get("id")?.trim() || null;
}

export function programsDetailUrl(programId: string): string {
	return `${ROUTES.PROGRAMS}/${encodeURIComponent(programId)}`;
}

export function pushProgramsSelectedId(programId: string | null): void {
	if (typeof window === "undefined") return;
	const next = programId ? programsDetailUrl(programId) : ROUTES.PROGRAMS;
	window.history.pushState({}, "", next);
}
