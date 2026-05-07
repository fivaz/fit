import { useState } from "react";

import useSWRInfinite from "swr/infinite";
import { useDebounceValue } from "usehooks-ts";

import { ExerciseFilterShellProps } from "@/components/exercise/exercise-filter-shell";
import { PAGE_SIZE } from "@/lib/consts";
import { getExercisesSearch } from "@/lib/exercise/api";
import { ExerciseUI } from "@/lib/exercise/type";
import { MuscleGroupType } from "@/lib/muscle/type";

type UseExerciseFiltersReturn = ExerciseFilterShellProps & {
	isLoading: boolean;
	fetchNextPage: () => void;
	hasNextPage: boolean;
	filteredExercises: ExerciseUI[];
};

export function useExerciseFilters(muscles: MuscleGroupType[]): UseExerciseFiltersReturn {
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [selectedMuscles, setSelectedMuscles] = useState<MuscleGroupType[]>(muscles);

	const [debouncedSearchQuery] = useDebounceValue(searchQuery, 300);

	const pageSize = PAGE_SIZE;

	const getKey = (pageIndex: number, previousPageData: ExerciseUI[]) => {
		if (previousPageData && !previousPageData.length) return null;
		return {
			search: debouncedSearchQuery,
			muscles: selectedMuscles,
			page: pageIndex + 1,
			pageSize,
		};
	};

	const { data, size, setSize, isLoading, isValidating } = useSWRInfinite(
		getKey,
		getExercisesSearch,
	);

	return {
		filteredExercises: data ? data.flat() : [],
		isLoading: isLoading || (isValidating && data && data.length === size) || false,
		fetchNextPage: () => setSize(size + 1),
		hasNextPage: data ? data[data.length - 1].length === pageSize : true,
		searchQuery,
		setSearchQuery,
		selectedMuscles,
		setSelectedMuscles,
		availableMuscles: muscles,
	};
}
