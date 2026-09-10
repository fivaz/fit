import { createEntityStore } from "@/hooks/optimistic/create-entity-store";
import { createEntityMutations } from "@/hooks/optimistic/use-entity-mutations";
import { ExerciseUI } from "@/lib/exercise/type";

export const [ExercisesProvider, useExercisesStore] = createEntityStore<ExerciseUI>();

export const useExerciseMutations = createEntityMutations(useExercisesStore);
