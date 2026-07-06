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

type HomeWorkoutFetchState = {
	loadKey: string;
	workout: WorkoutWithMappedSets | null;
	settled: boolean;
};

const initialHomeWorkoutFetchState: HomeWorkoutFetchState = {
	loadKey: "",
	workout: null,
	settled: false,
};

type ActiveWorkoutHomeState = {
	/** `undefined` while loading on Home, `null` when no active workout, otherwise the loaded workout. */
	activeWorkout: WorkoutWithMappedSets | null | undefined;
	hasActiveWorkout: boolean;
	isActiveWorkoutVisible: boolean;
	refreshActiveWorkout: () => void;
	/** Clears active-workout state and dismisses the Live Activity after a local finish. */
	notifyWorkoutFinished: () => void;
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
	const [homeWorkoutFetchState, setHomeWorkoutFetchState] = useState<HomeWorkoutFetchState>(
		initialHomeWorkoutFetchState,
	);
	const [liveActivityWorkoutLoad, setLiveActivityWorkoutLoad] = useState<{
		workoutId: string;
		refreshToken: number;
		workout: WorkoutWithMappedSets | null;
	} | null>(null);
	const [liveActivityExerciseSets, setLiveActivityExerciseSetsState] =
		useState<WorkoutSetMap | null>(null);
	const lastLiveActivityPayloadRef = useRef<WorkoutLiveActivityPayload | null>(null);
	const hadActiveWorkoutRef = useRef(false);

	const homeWorkoutLoadKey = useMemo(() => {
		if (!isHome || !activeWorkoutId) return "";
		return `${activeWorkoutId}:${refreshToken}`;
	}, [activeWorkoutId, isHome, refreshToken]);

	useEffect(() => {
		if (!isHome) {
			// Drop cached home workout when leaving the tab — otherwise returning shows pre-navigation data.
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setHomeWorkoutFetchState(initialHomeWorkoutFetchState);
		}
	}, [isHome]);

	const refreshActiveWorkout = useCallback(() => {
		setRefreshToken((token) => token + 1);
	}, []);

	const notifyWorkoutFinished = useCallback(() => {
		void dismissWorkoutLiveActivity(lastLiveActivityPayloadRef.current ?? undefined);
		lastLiveActivityPayloadRef.current = null;
		hadActiveWorkoutRef.current = false;
		setHasActiveWorkout(false);
		setActiveWorkoutId(null);
		setLiveActivityExerciseSetsState(null);
		setLiveActivityWorkoutLoad(null);
		setHomeWorkoutFetchState(initialHomeWorkoutFetchState);
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

		const loadKey = homeWorkoutLoadKey;
		let isCurrent = true;

		void getWorkoutById(activeWorkoutId)
			.then((workout) => {
				if (!isCurrent) return;
				setHomeWorkoutFetchState({ loadKey, workout, settled: true });
			})
			.catch(() => {
				if (!isCurrent) return;
				setHomeWorkoutFetchState({ loadKey, workout: null, settled: true });
			});

		return () => {
			isCurrent = false;
		};
	}, [activeWorkoutId, homeWorkoutLoadKey, isHome]);

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
		const workout = liveActivityWorkoutLoad.workout;
		if (!workout || workout.endDate) return null;
		return workout;
	}, [activeWorkoutId, liveActivityWorkoutLoad, refreshToken]);

	useEffect(() => {
		if (hadActiveWorkoutRef.current && !hasActiveWorkout) {
			void dismissWorkoutLiveActivity(lastLiveActivityPayloadRef.current ?? undefined);
			lastLiveActivityPayloadRef.current = null;
		}
		hadActiveWorkoutRef.current = hasActiveWorkout;
	}, [hasActiveWorkout]);

	const isHomeWorkoutLoading =
		Boolean(homeWorkoutLoadKey) &&
		(!homeWorkoutFetchState.settled || homeWorkoutFetchState.loadKey !== homeWorkoutLoadKey);

	const activeWorkout = useMemo(() => {
		if (!isHome) return null;
		if (!activeWorkoutId) return null;
		if (isHomeWorkoutLoading) return undefined;
		const workout = homeWorkoutFetchState.workout;
		if (!workout || workout.endDate) return null;
		return workout;
	}, [activeWorkoutId, homeWorkoutFetchState.workout, isHome, isHomeWorkoutLoading]);

	const value = useMemo(
		() => ({
			activeWorkout,
			hasActiveWorkout,
			isActiveWorkoutVisible: isHome && Boolean(activeWorkout),
			refreshActiveWorkout,
			notifyWorkoutFinished,
			setLiveActivityExerciseSets,
		}),
		[
			activeWorkout,
			hasActiveWorkout,
			isHome,
			notifyWorkoutFinished,
			refreshActiveWorkout,
			setLiveActivityExerciseSets,
		],
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
