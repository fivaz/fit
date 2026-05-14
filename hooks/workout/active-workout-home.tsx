"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { usePathname } from "next/navigation";

import { ROUTES } from "@/lib/consts";
import { getActiveWorkout, getWorkoutById } from "@/lib/workout/api";
import { WorkoutWithMappedSets } from "@/lib/workout/type";

type HomeWorkoutLoad = {
	workoutId: string;
	refreshToken: number;
	workout: WorkoutWithMappedSets | null;
};

type ActiveWorkoutHomeState = {
	/** `undefined` while loading on Home, `null` when no active workout, otherwise the loaded workout. */
	activeWorkout: WorkoutWithMappedSets | null | undefined;
	hasActiveWorkout: boolean;
	isActiveWorkoutVisible: boolean;
	refreshActiveWorkout: () => void;
};

const ActiveWorkoutHomeContext = createContext<ActiveWorkoutHomeState | null>(null);

export function ActiveWorkoutHomeProvider({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const isHome = pathname === ROUTES.HOME;
	const [refreshToken, setRefreshToken] = useState(0);
	const [hasActiveWorkout, setHasActiveWorkout] = useState(false);
	const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);
	const [homeWorkoutLoad, setHomeWorkoutLoad] = useState<HomeWorkoutLoad | null>(null);

	const refreshActiveWorkout = useCallback(() => {
		setRefreshToken((token) => token + 1);
	}, []);

	useEffect(() => {
		let isCurrent = true;

		void getActiveWorkout().then((active) => {
			if (!isCurrent) return;
			setHasActiveWorkout(Boolean(active));
			setActiveWorkoutId(active?.id ?? null);
		});

		return () => {
			isCurrent = false;
		};
	}, [refreshToken, pathname]);

	useEffect(() => {
		if (!isHome || !activeWorkoutId) return;

		let isCurrent = true;

		void getWorkoutById(activeWorkoutId).then((workout) => {
			if (!isCurrent) return;
			setHomeWorkoutLoad({ workoutId: activeWorkoutId, refreshToken, workout });
		});

		return () => {
			isCurrent = false;
		};
	}, [activeWorkoutId, isHome, refreshToken]);

	const activeWorkout = useMemo(() => {
		if (!isHome) return null;
		if (!activeWorkoutId) return null;
		if (
			!homeWorkoutLoad ||
			homeWorkoutLoad.workoutId !== activeWorkoutId ||
			homeWorkoutLoad.refreshToken !== refreshToken
		) {
			return undefined;
		}
		return homeWorkoutLoad.workout;
	}, [activeWorkoutId, homeWorkoutLoad, isHome, refreshToken]);

	const value = useMemo(
		() => ({
			activeWorkout,
			hasActiveWorkout,
			isActiveWorkoutVisible: isHome && Boolean(activeWorkout),
			refreshActiveWorkout,
		}),
		[activeWorkout, hasActiveWorkout, isHome, refreshActiveWorkout],
	);

	return (
		<ActiveWorkoutHomeContext.Provider value={value}>{children}</ActiveWorkoutHomeContext.Provider>
	);
}

export function useActiveWorkoutHome() {
	const context = useContext(ActiveWorkoutHomeContext);
	if (!context) {
		throw new Error("useActiveWorkoutHome must be used within ActiveWorkoutHomeProvider");
	}
	return context;
}
