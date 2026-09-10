import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
	DEFAULT_GROUP_NAME,
	type GeneratedPrograms,
	hasInvalidPrograms,
	MIN_EXERCISES_PER_PROGRAM,
	sanitizeGeneratedPrograms,
} from "./generate-schema";

describe("sanitizeGeneratedPrograms", () => {
	const catalogIdSet = new Set(["ex-1", "ex-2", "ex-3", "ex-4"]);

	const raw: GeneratedPrograms = {
		groupName: null,
		programs: [
			{
				name: "Upper A",
				muscles: ["chest", "back"],
				exerciseIds: ["ex-1", "ex-2", "ex-3"],
			},
		],
	};

	it("keeps valid exercise IDs in order", () => {
		const result = sanitizeGeneratedPrograms(raw, catalogIdSet);
		assert.deepEqual(result.programs[0]?.exerciseIds, ["ex-1", "ex-2", "ex-3"]);
		assert.equal(result.groupName, null);
	});

	it("drops hallucinated IDs", () => {
		const withHallucination: GeneratedPrograms = {
			groupName: null,
			programs: [
				{
					name: "Upper A",
					muscles: ["chest"],
					exerciseIds: ["ex-1", "fake-id", "ex-2", "ex-3"],
				},
			],
		};

		const result = sanitizeGeneratedPrograms(withHallucination, catalogIdSet);
		assert.deepEqual(result.programs[0]?.exerciseIds, ["ex-1", "ex-2", "ex-3"]);
	});

	it("dedupes exercise IDs within a program", () => {
		const withDupes: GeneratedPrograms = {
			groupName: null,
			programs: [
				{
					name: "Upper A",
					muscles: ["chest"],
					exerciseIds: ["ex-1", "ex-1", "ex-2", "ex-3"],
				},
			],
		};

		const result = sanitizeGeneratedPrograms(withDupes, catalogIdSet);
		assert.deepEqual(result.programs[0]?.exerciseIds, ["ex-1", "ex-2", "ex-3"]);
	});

	it("flags programs with too few valid exercises", () => {
		const tooFew: GeneratedPrograms = {
			groupName: null,
			programs: [
				{
					name: "Upper A",
					muscles: ["chest"],
					exerciseIds: ["ex-1", "fake-1", "fake-2"],
				},
			],
		};

		const result = sanitizeGeneratedPrograms(tooFew, catalogIdSet);
		assert.equal(result.programs[0]?.exerciseIds.length, 1);
		assert.equal(hasInvalidPrograms(result.programs), true);
		assert.equal(MIN_EXERCISES_PER_PROGRAM, 3);
	});

	it("assigns groupName for multi-program splits", () => {
		const split: GeneratedPrograms = {
			groupName: "4-Day Upper/Lower",
			programs: [
				{
					name: "Upper A",
					muscles: ["chest"],
					exerciseIds: ["ex-1", "ex-2", "ex-3"],
				},
				{
					name: "Lower A",
					muscles: ["quads"],
					exerciseIds: ["ex-2", "ex-3", "ex-4"],
				},
			],
		};

		const result = sanitizeGeneratedPrograms(split, catalogIdSet);
		assert.equal(result.groupName, "4-Day Upper/Lower");
	});

	it("uses default groupName when AI returns null for multiple programs", () => {
		const split: GeneratedPrograms = {
			groupName: null,
			programs: [
				{
					name: "Upper A",
					muscles: ["chest"],
					exerciseIds: ["ex-1", "ex-2", "ex-3"],
				},
				{
					name: "Lower A",
					muscles: ["quads"],
					exerciseIds: ["ex-2", "ex-3", "ex-4"],
				},
			],
		};

		const result = sanitizeGeneratedPrograms(split, catalogIdSet);
		assert.equal(result.groupName, DEFAULT_GROUP_NAME);
	});
});
