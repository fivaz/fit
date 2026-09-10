import { offlineDataAdapters } from "@/lib/offline/data-adapters";
import { ProgramGroupUI } from "@/lib/program-group/type";

export function getProgramGroups() {
	return offlineDataAdapters.getProgramGroups();
}

export function saveProgramGroup(group: ProgramGroupUI) {
	return offlineDataAdapters.saveProgramGroup(group);
}

export function deleteProgramGroup(id: string) {
	return offlineDataAdapters.deleteProgramGroup(id);
}
