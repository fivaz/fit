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
	exercises: ExerciseUI[];
	bodyMetrics: BodyMetricsUI | null;
	workoutSetsByWorkoutId: Record<string, WorkoutSetMap>;
	pendingOperations: PendingOperation[];
};

const OFFLINE_STORE_KEY = "fit:offline-store:v1";

const emptyStore: OfflineStore = {
	programs: [],
	programGroups: [],
	exercises: [],
	bodyMetrics: null,
	workoutSetsByWorkoutId: {},
	pendingOperations: [],
};

let isSyncingQueue = false;

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

function readStore(): OfflineStore {
	if (!isOfflineEnabled() || !isBrowser()) return emptyStore;

	try {
		const raw = window.localStorage.getItem(OFFLINE_STORE_KEY);
		if (!raw) return emptyStore;
		const parsed = JSON.parse(raw) as Partial<OfflineStore>;

		return {
			programs: parsed.programs ?? [],
			programGroups: parsed.programGroups ?? [],
			exercises: parsed.exercises ?? [],
			bodyMetrics: parsed.bodyMetrics ?? null,
			workoutSetsByWorkoutId: parsed.workoutSetsByWorkoutId ?? {},
			pendingOperations: parsed.pendingOperations ?? [],
		};
	} catch {
		return emptyStore;
	}
}

function writeStore(store: OfflineStore) {
	if (!isOfflineEnabled() || !isBrowser()) return;
	window.localStorage.setItem(OFFLINE_STORE_KEY, JSON.stringify(store));
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

async function flushPendingOperations() {
	if (!isOfflineEnabled() || !isBrowser() || isSyncingQueue) return;

	isSyncingQueue = true;
	try {
		if (!(await isNetworkAvailable())) return;

		const store = readStore();
		const remaining: PendingOperation[] = [];

		for (const operation of store.pendingOperations) {
			try {
				await apiFetch<void>(operation.url, {
					method: operation.method,
					body: operation.body,
				});
			} catch {
				remaining.push(operation);
			}
		}

		writeStore({
			...store,
			pendingOperations: remaining,
		});
	} finally {
		isSyncingQueue = false;
	}
}

function upsertById<T extends { id: string }>(items: T[], item: T): T[] {
	const index = items.findIndex((value) => value.id === item.id);
	if (index === -1) return [...items, item];
	const next = [...items];
	next[index] = item;
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
	await flushPendingOperations();
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
			updateStore((store) => ({
				...store,
				programs: upsertById(store.programs, {
					id: program.id,
					name: program.name,
					muscles: program.muscles,
					imageUrl: program.imageUrl,
					order: program.order,
					groupId: program.groupId,
				}),
				exercises: program.exercises.map(({ order: _order, ...exercise }) => exercise),
			}));
			return program;
		} catch {
			return null;
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
		updateStore((store) => ({
			...store,
			programs: upsertById(store.programs, program),
		}));
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
			programs: store.programs.map((program) =>
				program.groupId === id ? { ...program, groupId: null } : program,
			),
		}));
		await runOrQueue({
			url: `/api/program-groups/${id}`,
			method: "DELETE",
		});
	},

	async updateProgramExercises(exerciseIds: string[], programId: string) {
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
			}));
			return merged;
		} catch {
			return null;
		}
	},

	async getActiveWorkout(): Promise<{ id: string } | null> {
		if (!isOfflineEnabled()) {
			return apiFetch<{ id: string } | null>("/api/workouts/active");
		}
		await flushPendingOperations();
		try {
			return await apiFetch<{ id: string } | null>("/api/workouts/active");
		} catch {
			return null;
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
		return apiFetch<{ id: string }>("/api/workouts", {
			method: "POST",
			body: { programId },
		});
	},

	async finishWorkout(workoutId: string) {
		await runOrQueue({
			url: `/api/workouts/${workoutId}/finish`,
			method: "POST",
		});
	},
};
