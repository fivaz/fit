import { apiFetch } from "@/lib/api-client";
import { BodyMetricsUI } from "@/lib/body-metrics/type";
import { ExerciseUI } from "@/lib/exercise/type";
import { isNetworkAvailable } from "@/lib/mobile/network";
import { isOfflineEnabled } from "@/lib/offline/config";
import { ProgramUI } from "@/lib/program/type";
import { ProgramWithExercises } from "@/lib/program/type";
import { ProgramGroupUI } from "@/lib/program-group/type";
import { WorkoutSetMap } from "@/lib/workout/type";
import { WorkoutWithMappedSets } from "@/lib/workout/type";

type HttpMethod = "POST" | "PUT" | "PATCH" | "DELETE";

type PendingOperation = {
	id: string;
	url: string;
	method: HttpMethod;
	body?: unknown;
	createdAt: string;
};

type OfflineStore = {
	programs: ProgramUI[];
	programGroups: ProgramGroupUI[];
	/** Last full program (with its exercises) fetched per id — the offline fallback for `getProgramById`. */
	programDetailsById: Record<string, ProgramWithExercises>;
	exercises: ExerciseUI[];
	bodyMetrics: BodyMetricsUI | null;
	workoutSetsByWorkoutId: Record<string, WorkoutSetMap>;
	/** Last full workout fetched per id — the offline fallback for `getWorkoutById`. */
	workoutsById: Record<string, WorkoutWithMappedSets>;
	/** Last workout id confirmed active by the server — the offline fallback for `getActiveWorkout`. */
	activeWorkoutId: string | null;
	pendingOperations: PendingOperation[];
};

const OFFLINE_STORE_KEY = "fit:offline-store:v1";

const emptyStore: OfflineStore = {
	programs: [],
	programGroups: [],
	programDetailsById: {},
	exercises: [],
	bodyMetrics: null,
	workoutSetsByWorkoutId: {},
	workoutsById: {},
	activeWorkoutId: null,
	pendingOperations: [],
};

// In-flight or recently edited sets — merged over API reads until sync succeeds.
const optimisticWorkoutSets = new Map<string, WorkoutSetMap>();

function applyCachedWorkoutSets(
	workout: WorkoutWithMappedSets,
	workoutId: string,
): WorkoutWithMappedSets {
	const optimistic = optimisticWorkoutSets.get(workoutId);
	if (optimistic) {
		return { ...workout, exerciseSets: optimistic };
	}

	if (isOfflineEnabled()) {
		const localSets = readStore().workoutSetsByWorkoutId[workoutId];
		if (localSets !== undefined) {
			return { ...workout, exerciseSets: localSets };
		}
	}

	return workout;
}

function isBrowser() {
	return typeof window !== "undefined";
}

/** The last parsed store and the raw JSON it came from, so unchanged storage isn't re-parsed. */
let parsedStore: { raw: string; store: OfflineStore } | null = null;
const storeListeners = new Set<() => void>();

function readStore(): OfflineStore {
	if (!isOfflineEnabled() || !isBrowser()) return emptyStore;

	try {
		const raw = window.localStorage.getItem(OFFLINE_STORE_KEY);
		if (!raw) return emptyStore;
		// Same object for the same JSON: screens subscribed through `getOfflineSnapshot` compare
		// snapshots by reference and would re-render forever on a fresh parse each time.
		if (parsedStore?.raw === raw) return parsedStore.store;
		const parsed = JSON.parse(raw) as Partial<OfflineStore>;

		const store: OfflineStore = {
			programs: parsed.programs ?? [],
			programGroups: parsed.programGroups ?? [],
			programDetailsById: parsed.programDetailsById ?? {},
			exercises: parsed.exercises ?? [],
			bodyMetrics: parsed.bodyMetrics ?? null,
			workoutSetsByWorkoutId: parsed.workoutSetsByWorkoutId ?? {},
			workoutsById: parsed.workoutsById ?? {},
			activeWorkoutId: parsed.activeWorkoutId ?? null,
			pendingOperations: parsed.pendingOperations ?? [],
		};
		parsedStore = { raw, store };
		return store;
	} catch {
		return emptyStore;
	}
}

function writeStore(store: OfflineStore) {
	if (!isOfflineEnabled() || !isBrowser()) return;
	const raw = JSON.stringify(store);
	window.localStorage.setItem(OFFLINE_STORE_KEY, raw);
	parsedStore = { raw, store };
	for (const listener of storeListeners) listener();
}

/** Read-only view of the device cache, for screens to show saved data before the API answers. */
export type OfflineSnapshot = Pick<
	OfflineStore,
	"programs" | "programGroups" | "programDetailsById" | "exercises" | "bodyMetrics" | "workoutsById"
>;

/** The current cache; the same object until something is written. Empty when offline mode is off. */
export function getOfflineSnapshot(): OfflineSnapshot {
	return readStore();
}

export function subscribeToOfflineStore(listener: () => void): () => void {
	storeListeners.add(listener);
	return () => {
		storeListeners.delete(listener);
	};
}

function updateStore(update: (store: OfflineStore) => OfflineStore) {
	const current = readStore();
	writeStore(update(current));
}

function enqueueOperation(operation: Omit<PendingOperation, "id" | "createdAt">) {
	updateStore((store) => ({
		...store,
		pendingOperations: [
			...store.pendingOperations,
			{
				...operation,
				id: crypto.randomUUID(),
				createdAt: new Date().toISOString(),
			},
		],
	}));
}

/** The flush currently draining the queue, so later callers wait for it instead of skipping it. */
let flushInFlight: Promise<void> | null = null;

/**
 * Sends queued mutations in order. Concurrent callers share one run, and the run keeps going until
 * nothing new is queued, so a read that awaits this sees every earlier write on the server.
 */
function flushPendingOperations(): Promise<void> {
	if (!isOfflineEnabled() || !isBrowser()) return Promise.resolve();
	flushInFlight ??= drainPendingOperations().finally(() => {
		flushInFlight = null;
	});
	return flushInFlight;
}

async function drainPendingOperations() {
	if (!(await isNetworkAvailable())) return;

	// Each operation is tried once per run; failures stay queued for the next run.
	const attempted = new Set<string>();
	for (;;) {
		// Re-read every time: saves made while a request is in flight (e.g. during an API cold start)
		// are appended to the stored queue and must go out in this same run.
		const operation = readStore().pendingOperations.find(({ id }) => !attempted.has(id));
		if (!operation) return;
		attempted.add(operation.id);

		try {
			await apiFetch<void>(operation.url, {
				method: operation.method,
				body: operation.body,
			});
		} catch {
			continue;
		}
		// Remove only this operation, from the current store: writing back a snapshot taken before the
		// request would drop whatever was saved or cached while it was in flight.
		updateStore((store) => ({
			...store,
			pendingOperations: store.pendingOperations.filter(({ id }) => id !== operation.id),
		}));
	}
}

function upsertById<T extends { id: string }>(items: T[], item: T): T[] {
	const index = items.findIndex((value) => value.id === item.id);
	if (index === -1) return [...items, item];
	const next = [...items];
	next[index] = item;
	return next;
}

/** Upserts every item: a partial list (e.g. one program's exercises) must not replace the whole cache. */
function upsertAllById<T extends { id: string }>(items: T[], updates: T[]): T[] {
	return updates.reduce(upsertById, items);
}

function withoutKeys<T>(record: Record<string, T>, keys: string[]): Record<string, T> {
	const next = { ...record };
	for (const key of keys) delete next[key];
	return next;
}

function removeById<T extends { id: string }>(items: T[], id: string): T[] {
	return items.filter((item) => item.id !== id);
}

async function runOrQueue(operation: Omit<PendingOperation, "id" | "createdAt">) {
	if (!isOfflineEnabled()) {
		await apiFetch<void>(operation.url, {
			method: operation.method,
			body: operation.body,
		});
		return;
	}
	enqueueOperation(operation);
	// Don't make the caller wait for the upload: the local store already has the change, and a cold
	// API container can take many seconds to answer. Reads await the flush, so they still see it.
	void flushPendingOperations();
}

/**
 * GET for data the server computes from other records (progress stats, logs, counts), which has no
 * local fallback. Waits for queued writes first, so e.g. Progress includes a workout finished a
 * moment ago even though finishing no longer waits for the upload.
 */
export async function fetchAfterPendingWrites<T>(input: string): Promise<T> {
	await flushPendingOperations();
	return apiFetch<T>(input);
}

export const offlineDataAdapters = {
	async syncNow() {
		if (!isOfflineEnabled()) return;
		await flushPendingOperations();
	},

	getProgramsLocal() {
		return readStore().programs;
	},

	async getPrograms() {
		if (!isOfflineEnabled()) {
			return apiFetch<ProgramUI[]>("/api/programs");
		}
		await flushPendingOperations();
		try {
			const programs = await apiFetch<ProgramUI[]>("/api/programs");
			this.setProgramsLocal(programs);
			return programs;
		} catch {
			return this.getProgramsLocal();
		}
	},

	async getProgramById(programId: string): Promise<ProgramWithExercises | null> {
		if (!isOfflineEnabled()) {
			return apiFetch<ProgramWithExercises>(`/api/programs/${programId}`);
		}
		await flushPendingOperations();
		try {
			const program = await apiFetch<ProgramWithExercises>(`/api/programs/${programId}`);
			const { exercises, ...programFields } = program;
			updateStore((store) => ({
				...store,
				programs: upsertById(store.programs, programFields),
				programDetailsById: { ...store.programDetailsById, [program.id]: program },
				exercises: upsertAllById(
					store.exercises,
					exercises.map(({ order: _order, ...exercise }) => exercise),
				),
			}));
			return program;
		} catch {
			return readStore().programDetailsById[programId] ?? null;
		}
	},

	setProgramsLocal(programs: ProgramUI[]) {
		if (!isOfflineEnabled()) return;
		updateStore((store) => ({ ...store, programs }));
	},

	async saveProgram(program: ProgramUI) {
		if (!isOfflineEnabled()) {
			await apiFetch<void>("/api/programs", { method: "POST", body: program });
			return;
		}
		updateStore((store) => {
			const details = store.programDetailsById[program.id];
			return {
				...store,
				programs: upsertById(store.programs, program),
				programDetailsById: details
					? { ...store.programDetailsById, [program.id]: { ...details, ...program } }
					: store.programDetailsById,
			};
		});
		await runOrQueue({
			url: "/api/programs",
			method: "POST",
			body: program,
		});
	},

	async generatePrograms(description: string) {
		return apiFetch<{ programs: ProgramWithExercises[]; group: ProgramGroupUI | null }>(
			"/api/programs/generate",
			{
				method: "POST",
				body: { description },
			},
		);
	},

	async reorderPrograms(groupId: string | null, sortedIds: string[]) {
		if (!isOfflineEnabled()) {
			await apiFetch<void>("/api/programs/reorder", {
				method: "PATCH",
				body: { groupId, sortedIds },
			});
			return;
		}
		updateStore((store) => ({
			...store,
			programs: store.programs.map((program) => {
				const nextOrder = sortedIds.indexOf(program.id);
				return nextOrder === -1 ? program : { ...program, groupId, order: nextOrder };
			}),
		}));
		await runOrQueue({
			url: "/api/programs/reorder",
			method: "PATCH",
			body: { groupId, sortedIds },
		});
	},

	async deleteProgram(id: string) {
		if (!isOfflineEnabled()) {
			await apiFetch<void>(`/api/programs/${id}`, { method: "DELETE" });
			return;
		}
		updateStore((store) => ({
			...store,
			programs: removeById(store.programs, id),
			programDetailsById: withoutKeys(store.programDetailsById, [id]),
		}));
		await runOrQueue({
			url: `/api/programs/${id}`,
			method: "DELETE",
		});
	},

	getProgramGroupsLocal() {
		return readStore().programGroups;
	},

	setProgramGroupsLocal(programGroups: ProgramGroupUI[]) {
		if (!isOfflineEnabled()) return;
		updateStore((store) => ({ ...store, programGroups }));
	},

	async getProgramGroups() {
		if (!isOfflineEnabled()) {
			return apiFetch<ProgramGroupUI[]>("/api/program-groups");
		}
		await flushPendingOperations();
		try {
			const programGroups = await apiFetch<ProgramGroupUI[]>("/api/program-groups");
			this.setProgramGroupsLocal(programGroups);
			return programGroups;
		} catch {
			return this.getProgramGroupsLocal();
		}
	},

	async saveProgramGroup(group: ProgramGroupUI) {
		if (!isOfflineEnabled()) {
			await apiFetch<void>("/api/program-groups", { method: "POST", body: group });
			return;
		}
		updateStore((store) => ({
			...store,
			programGroups: upsertById(store.programGroups, group),
		}));
		await runOrQueue({
			url: "/api/program-groups",
			method: "POST",
			body: group,
		});
	},

	async deleteProgramGroup(id: string) {
		if (!isOfflineEnabled()) {
			await apiFetch<void>(`/api/program-groups/${id}`, { method: "DELETE" });
			return;
		}
		updateStore((store) => ({
			...store,
			programGroups: removeById(store.programGroups, id),
			programs: store.programs.filter((program) => program.groupId !== id),
			programDetailsById: withoutKeys(
				store.programDetailsById,
				store.programs.filter((program) => program.groupId === id).map(({ id }) => id),
			),
		}));
		await runOrQueue({
			url: `/api/program-groups/${id}`,
			method: "DELETE",
		});
	},

	async updateProgramExercises(exerciseIds: string[], programId: string) {
		if (isOfflineEnabled()) {
			updateStore((store) => {
				const details = store.programDetailsById[programId];
				if (!details) return store;
				// New ones come from the cached library; ones already in the program keep their data.
				const known = new Map<string, ExerciseUI>(
					[...store.exercises, ...details.exercises].map((exercise) => [exercise.id, exercise]),
				);
				const exercises = exerciseIds.flatMap((id, order) => {
					const exercise = known.get(id);
					return exercise ? [{ ...exercise, order }] : [];
				});
				return {
					...store,
					programDetailsById: {
						...store.programDetailsById,
						[programId]: { ...details, exercises },
					},
				};
			});
		}
		await runOrQueue({
			url: `/api/programs/${programId}/exercises`,
			method: "PUT",
			body: { exerciseIds },
		});
	},

	getExercisesLocal() {
		return readStore().exercises;
	},

	setExercisesLocal(exercises: ExerciseUI[]) {
		if (!isOfflineEnabled()) return;
		updateStore((store) => ({ ...store, exercises }));
	},

	async getExercisesSearch(params: {
		search?: string;
		muscles?: string[];
		page: number;
		pageSize: number;
	}): Promise<ExerciseUI[]> {
		const query = new URLSearchParams({
			page: String(params.page),
			pageSize: String(params.pageSize),
		});

		if (params.search) query.set("search", params.search);
		params.muscles?.forEach((muscle) => query.append("muscles", muscle));

		if (!isOfflineEnabled()) {
			return apiFetch<ExerciseUI[]>(`/api/exercises?${query.toString()}`);
		}

		await flushPendingOperations();
		try {
			const exercises = await apiFetch<ExerciseUI[]>(`/api/exercises?${query.toString()}`);
			updateStore((store) => {
				const merged = [...store.exercises];
				for (const exercise of exercises) {
					const index = merged.findIndex((item) => item.id === exercise.id);
					if (index >= 0) merged[index] = exercise;
					else merged.push(exercise);
				}
				return { ...store, exercises: merged };
			});
			return exercises;
		} catch {
			const local = readStore().exercises;
			const search = params.search?.trim().toLowerCase();
			const filtered = local.filter((exercise) => {
				const matchesSearch = !search || exercise.name.toLowerCase().includes(search);
				const matchesMuscles =
					!params.muscles?.length ||
					params.muscles.some((muscle) =>
						exercise.muscles.includes(muscle as ExerciseUI["muscles"][number]),
					);
				return matchesSearch && matchesMuscles;
			});
			const start = (params.page - 1) * params.pageSize;
			return filtered.slice(start, start + params.pageSize);
		}
	},

	async saveExercise(exercise: ExerciseUI) {
		if (!isOfflineEnabled()) {
			await apiFetch<void>("/api/exercises", { method: "POST", body: exercise });
			return;
		}
		updateStore((store) => ({
			...store,
			exercises: upsertById(store.exercises, exercise),
		}));
		await runOrQueue({
			url: "/api/exercises",
			method: "POST",
			body: exercise,
		});
	},

	async deleteExercise(id: string) {
		if (!isOfflineEnabled()) {
			await apiFetch<void>(`/api/exercises/${id}`, { method: "DELETE" });
			return;
		}
		updateStore((store) => ({
			...store,
			exercises: removeById(store.exercises, id),
		}));
		await runOrQueue({
			url: `/api/exercises/${id}`,
			method: "DELETE",
		});
	},

	async reorderProgramExercises(programId: string, exerciseIds: string[]) {
		if (isOfflineEnabled()) {
			updateStore((store) => {
				const details = store.programDetailsById[programId];
				if (!details) return store;
				const exercises = details.exercises
					.map((exercise) => ({ ...exercise, order: exerciseIds.indexOf(exercise.id) }))
					.sort((a, b) => a.order - b.order);
				return {
					...store,
					programDetailsById: {
						...store.programDetailsById,
						[programId]: { ...details, exercises },
					},
				};
			});
		}
		await runOrQueue({
			url: `/api/programs/${programId}/exercises/reorder`,
			method: "PATCH",
			body: { exerciseIds },
		});
	},

	getBodyMetricsLocal() {
		return readStore().bodyMetrics;
	},

	async getBodyMetrics() {
		if (!isOfflineEnabled()) {
			return apiFetch<BodyMetricsUI>("/api/body-metrics");
		}
		await flushPendingOperations();
		try {
			const metrics = await apiFetch<BodyMetricsUI>("/api/body-metrics");
			this.setBodyMetricsLocal(metrics);
			return metrics;
		} catch {
			return this.getBodyMetricsLocal();
		}
	},

	setBodyMetricsLocal(metrics: BodyMetricsUI) {
		if (!isOfflineEnabled()) return;
		updateStore((store) => ({
			...store,
			bodyMetrics: metrics,
		}));
	},

	async saveBodyMetrics(metrics: BodyMetricsUI) {
		if (!isOfflineEnabled()) {
			await apiFetch<void>("/api/body-metrics", { method: "PUT", body: metrics });
			return;
		}
		updateStore((store) => ({
			...store,
			bodyMetrics: metrics,
		}));
		await runOrQueue({
			url: "/api/body-metrics",
			method: "PUT",
			body: metrics,
		});
	},

	getWorkoutSetsLocal(workoutId: string) {
		return readStore().workoutSetsByWorkoutId[workoutId] ?? {};
	},

	stageWorkoutSets(workoutId: string, exerciseSetsMap: WorkoutSetMap) {
		optimisticWorkoutSets.set(workoutId, exerciseSetsMap);
	},

	async syncWorkoutSets(workoutId: string, exerciseSetsMap: WorkoutSetMap) {
		optimisticWorkoutSets.set(workoutId, exerciseSetsMap);
		if (!isOfflineEnabled()) {
			await apiFetch<void>(`/api/workouts/${workoutId}/sets`, {
				method: "PUT",
				body: { exerciseSetsMap },
			});
			optimisticWorkoutSets.delete(workoutId);
			return exerciseSetsMap;
		}
		updateStore((store) => ({
			...store,
			workoutSetsByWorkoutId: {
				...store.workoutSetsByWorkoutId,
				[workoutId]: exerciseSetsMap,
			},
		}));
		await runOrQueue({
			url: `/api/workouts/${workoutId}/sets`,
			method: "PUT",
			body: { exerciseSetsMap },
		});
		optimisticWorkoutSets.delete(workoutId);
		return exerciseSetsMap;
	},

	async getWorkoutById(workoutId: string): Promise<WorkoutWithMappedSets | null> {
		if (!isOfflineEnabled()) {
			const workout = await apiFetch<WorkoutWithMappedSets>(`/api/workouts/${workoutId}`);
			return applyCachedWorkoutSets(workout, workoutId);
		}
		await flushPendingOperations();
		try {
			const workout = await apiFetch<WorkoutWithMappedSets>(`/api/workouts/${workoutId}`);
			const merged = applyCachedWorkoutSets(workout, workoutId);
			updateStore((store) => ({
				...store,
				workoutSetsByWorkoutId: {
					...store.workoutSetsByWorkoutId,
					[workoutId]: merged.exerciseSets,
				},
				workoutsById: {
					...store.workoutsById,
					[workoutId]: merged,
				},
			}));
			return merged;
		} catch {
			const cached = readStore().workoutsById[workoutId];
			return cached ? applyCachedWorkoutSets(cached, workoutId) : null;
		}
	},

	async getActiveWorkout(): Promise<{ id: string } | null> {
		if (!isOfflineEnabled()) {
			return (await apiFetch<{ id: string } | null>("/api/workouts/active")) ?? null;
		}
		await flushPendingOperations();
		try {
			const active = (await apiFetch<{ id: string } | null>("/api/workouts/active")) ?? null;
			updateStore((store) => ({ ...store, activeWorkoutId: active?.id ?? null }));
			return active;
		} catch {
			const activeWorkoutId = readStore().activeWorkoutId;
			return activeWorkoutId ? { id: activeWorkoutId } : null;
		}
	},

	async startWorkout(programId: string) {
		if (!isOfflineEnabled()) {
			return apiFetch<{ id: string }>("/api/workouts", {
				method: "POST",
				body: { programId },
			});
		}
		await flushPendingOperations();
		const workout = await apiFetch<{ id: string }>("/api/workouts", {
			method: "POST",
			body: { programId },
		});
		updateStore((store) => ({ ...store, activeWorkoutId: workout.id }));
		return workout;
	},

	async finishWorkout(workoutId: string) {
		if (isOfflineEnabled()) {
			updateStore((store) => ({
				...store,
				activeWorkoutId: store.activeWorkoutId === workoutId ? null : store.activeWorkoutId,
			}));
		}
		await runOrQueue({
			url: `/api/workouts/${workoutId}/finish`,
			method: "POST",
		});
	},
};
