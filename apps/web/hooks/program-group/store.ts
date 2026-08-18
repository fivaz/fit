import { createEntityStore } from "@/hooks/optimistic/create-entity-store";
import { createEntityMutations } from "@/hooks/optimistic/use-entity-mutations";
import { ProgramGroupUI } from "@/lib/program-group/type";

export const [ProgramGroupsProvider, useProgramGroupsStore] = createEntityStore<ProgramGroupUI>();

export const useProgramGroupMutations = createEntityMutations(useProgramGroupsStore);
