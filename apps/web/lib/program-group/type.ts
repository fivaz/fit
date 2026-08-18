import { buildEmptyProgramGroup, type ProgramGroupUI } from "@fit/shared";

export { buildEmptyProgramGroup, type ProgramGroupUI };

export function formToProgramGroup(formData: FormData): ProgramGroupUI {
	return {
		id: (formData.get("id") as string) || "",
		name: (formData.get("name") as string) || "",
		order: 0,
	};
}
