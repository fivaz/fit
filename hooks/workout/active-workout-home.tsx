"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { usePathname } from "next/navigation";

import { WorkoutLiveActivityBridge } from "@/components/workout/workout-live-activity-bridge";
import { ROUTES } from "@/lib/consts";
import {
	dismissWorkoutLiveActivity,
	WorkoutLiveActivityPayload,
} from "@/lib/mobile/workout-live-activity";
import { getActiveWorkout, getWorkoutById } from "@/lib/workout/api";
import { WorkoutSetMap, WorkoutWithMappedSets } from "@/lib/workout/type";

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
	/** Pushes in-session set edits from the workout screen into the Live Activity bridge. */
	setLiveActivityExerciseSets: (exerciseSets: WorkoutSetMap | null) => void;
};

const ActiveWorkoutHomeContext = createContext<ActiveWorkoutHomeState | null>(null);

export function ActiveWorkoutHomeProvider({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const isHome = pathname === ROUTES.HOME;
	const [refreshToken, setRefreshToken] = useState(0);
	const [hasActiveWorkout, setHasActiveWorkout] = useState(false);
	const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);
	const [homeWorkoutLoad, setHomeWorkoutLoad] = useState<HomeWorkoutLoad | null>(null);
	const [liveActivityWorkoutLoad, setLiveActivityWorkoutLoad] = useState<{
		workoutId: string;
		refreshToken: number;
		workout: WorkoutWithMappedSets | null;
	} | null>(null);
	const [liveActivityExerciseSets, setLiveActivityExerciseSetsState] =
		useState<WorkoutSetMap | null>(null);
	const lastLiveActivityPayloadRef = useRef<WorkoutLiveActivityPayload | null>(null);
	const hadActiveWorkoutRef = useRef(false);

	const refreshActiveWorkout = useCallback(() => {
		setRefreshToken((token) => token + 1);
	}, []);

	const setLiveActivityExerciseSets = useCallback((exerciseSets: WorkoutSetMap | null) => {
		setLiveActivityExerciseSetsState(exerciseSets);
	}, []);

	const handleLiveActivityPayloadChange = useCallback((payload: WorkoutLiveActivityPayload) => {
		lastLiveActivityPayloadRef.current = payload;
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

	useEffect(() => {
		if (!activeWorkoutId) return;

		let isCurrent = true;

		void getWorkoutById(activeWorkoutId).then((workout) => {
			if (!isCurrent) return;
			setLiveActivityWorkoutLoad({ workoutId: activeWorkoutId, refreshToken, workout });
		});

		return () => {
			isCurrent = false;
		};
	}, [activeWorkoutId, refreshToken]);

	const liveActivityWorkout = useMemo(() => {
		if (!activeWorkoutId) return null;
		if (
			!liveActivityWorkoutLoad ||
			liveActivityWorkoutLoad.workoutId !== activeWorkoutId ||
			liveActivityWorkoutLoad.refreshToken !== refreshToken
		) {
			return null;
		}
		return liveActivityWorkoutLoad.workout;
	}, [activeWorkoutId, liveActivityWorkoutLoad, refreshToken]);

	useEffect(() => {
		if (hadActiveWorkoutRef.current && !hasActiveWorkout) {
			void dismissWorkoutLiveActivity(lastLiveActivityPayloadRef.current ?? undefined);
			lastLiveActivityPayloadRef.current = null;
		}
		hadActiveWorkoutRef.current = hasActiveWorkout;
	}, [hasActiveWorkout]);

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
			setLiveActivityExerciseSets,
		}),
		[activeWorkout, hasActiveWorkout, isHome, refreshActiveWorkout, setLiveActivityExerciseSets],
	);

	return (
		<ActiveWorkoutHomeContext.Provider value={value}>
			{liveActivityWorkout ? (
				<WorkoutLiveActivityBridge
					key={liveActivityWorkout.id}
					workout={liveActivityWorkout}
					exerciseSetsOverride={liveActivityExerciseSets}
					onPayloadChange={handleLiveActivityPayloadChange}
				/>
			) : null}
			{children}
		</ActiveWorkoutHomeContext.Provider>
	);
}

export function useActiveWorkoutHome() {
	const context = useContext(ActiveWorkoutHomeContext);
	if (!context) {
		throw new Error("useActiveWorkoutHome must be used within ActiveWorkoutHomeProvider");
	}
	return context;
}
