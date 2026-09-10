export type ProgramGroupUI = {
	id: string;
	name: string;
	order: number;
};

export function buildEmptyProgramGroup(): ProgramGroupUI {
	return {
		id: "",
		name: "",
		order: 0,
	};
}
