export const UNGROUPED_GROUP_ID = "__ungrouped__";

export const PROGRAMS_UI_PREFS_KEY = "fit:programs-ui:v1";

type ProgramsUiPrefs = {
	collapsedGroupIds: string[];
};

const defaultPrefs: ProgramsUiPrefs = {
	collapsedGroupIds: [],
};

function isBrowser() {
	return typeof window !== "undefined";
}

export function readProgramsUiPrefs(): ProgramsUiPrefs {
	if (!isBrowser()) return defaultPrefs;

	try {
		const raw = window.localStorage.getItem(PROGRAMS_UI_PREFS_KEY);
		if (!raw) return defaultPrefs;

		const parsed = JSON.parse(raw) as Partial<ProgramsUiPrefs>;
		return {
			collapsedGroupIds: parsed.collapsedGroupIds ?? [],
		};
	} catch {
		return defaultPrefs;
	}
}

export function writeProgramsUiPrefs(prefs: ProgramsUiPrefs) {
	if (!isBrowser()) return;
	window.localStorage.setItem(PROGRAMS_UI_PREFS_KEY, JSON.stringify(prefs));
}

export function isGroupCollapsed(groupId: string) {
	return readProgramsUiPrefs().collapsedGroupIds.includes(groupId);
}

export function setGroupCollapsed(groupId: string, collapsed: boolean) {
	const prefs = readProgramsUiPrefs();
	const collapsedGroupIds = new Set(prefs.collapsedGroupIds);

	if (collapsed) {
		collapsedGroupIds.add(groupId);
	} else {
		collapsedGroupIds.delete(groupId);
	}

	writeProgramsUiPrefs({
		collapsedGroupIds: [...collapsedGroupIds],
	});
}
