import { createEntityStore } from "@/hooks/optimistic/create-entity-store";
import { createEntityMutations } from "@/hooks/optimistic/use-entity-mutations";
import { ProgramUI } from "@/lib/program/type";

export const [ProgramsProvider, useProgramsStore] = createEntityStore<ProgramUI>();

export const useProgramMutations = createEntityMutations(useProgramsStore);
