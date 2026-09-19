import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
	DEFAULT_GROUP_NAME,
	filterCatalogByMuscles,
	type GeneratedPlan,
	hasInvalidPrograms,
	MIN_EXERCISES_PER_PROGRAM,
	resolveGroupName,
	sanitizeExerciseIds,
} from "./generate-schema";

describe("filterCatalogByMuscles", () => {
	const catalog = [
		{ id: "bench", muscles: ["chest", "triceps"] as const },
		{ id: "squat", muscles: ["quads"] as const },
		{ id: "row", muscles: ["back"] as const },
	].map((exercise) => ({ ...exercise, muscles: [...exercise.muscles] }));

	it("keeps only exercises targeting at least one of the muscles", () => {
		const result = filterCatalogByMuscles(catalog, ["chest", "back"]);
		assert.deepEqual(
			result.map(({ id }) => id),
			["bench", "row"],
		);
	});

	it("returns nothing when no exercise matches", () => {
		assert.deepEqual(filterCatalogByMuscles(catalog, ["calves"]), []);
	});
});

describe("sanitizeExerciseIds", () => {
	const allowed = new Set(["ex-1", "ex-2", "ex-3", "ex-4"]);

	it("keeps valid exercise IDs in order", () => {
		assert.deepEqual(sanitizeExerciseIds(["ex-1", "ex-2", "ex-3"], allowed, 5), [
			"ex-1",
			"ex-2",
			"ex-3",
		]);
	});

	it("drops IDs outside the allowed set", () => {
		assert.deepEqual(sanitizeExerciseIds(["ex-1", "fake-id", "ex-2", "ex-3"], allowed, 5), [
			"ex-1",
			"ex-2",
			"ex-3",
		]);
	});

	it("dedupes IDs", () => {
		assert.deepEqual(sanitizeExerciseIds(["ex-1", "ex-1", "ex-2", "ex-3"], allowed, 5), [
			"ex-1",
			"ex-2",
			"ex-3",
		]);
	});

	it("caps the list at the limit", () => {
		assert.deepEqual(sanitizeExerciseIds(["ex-1", "ex-2", "ex-3", "ex-4"], allowed, 3), [
			"ex-1",
			"ex-2",
			"ex-3",
		]);
	});

	it("flags programs with too few valid exercises", () => {
		const exerciseIds = sanitizeExerciseIds(["ex-1", "fake-1", "fake-2"], allowed, 5);
		assert.equal(exerciseIds.length, 1);
		assert.equal(hasInvalidPrograms([{ name: "Upper A", muscles: ["chest"], exerciseIds }]), true);
		assert.equal(MIN_EXERCISES_PER_PROGRAM, 3);
	});
});

describe("resolveGroupName", () => {
	const program = { name: "Day", muscles: ["chest" as const], exerciseCount: 4 };

	it("uses the AI's groupName for multi-program splits", () => {
		const plan: GeneratedPlan = { groupName: "4-Day Upper/Lower", programs: [program, program] };
		assert.equal(resolveGroupName(plan), "4-Day Upper/Lower");
	});

	it("uses default groupName when AI returns null for multiple programs", () => {
		const plan: GeneratedPlan = { groupName: null, programs: [program, program] };
		assert.equal(resolveGroupName(plan), DEFAULT_GROUP_NAME);
	});

	it("returns null for a single program", () => {
		const plan: GeneratedPlan = { groupName: "Ignored", programs: [program] };
		assert.equal(resolveGroupName(plan), null);
	});
});
