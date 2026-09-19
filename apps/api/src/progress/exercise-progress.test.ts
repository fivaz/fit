import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildExerciseProgress, type SetForExerciseProgress } from "./exercise-progress";

const logged = (reps: number, weight: number | null, isWarmup = false): SetForExerciseProgress => ({
	reps,
	weight,
	isWarmup,
	time: new Date("2026-01-01T10:00:00Z"),
});

describe("buildExerciseProgress", () => {
	const exercises = [
		{ id: "bench", name: "Bench Press", imageUrl: "https://example.com/bench.jpg" },
		{ id: "squat", name: "Squat", imageUrl: null },
	];

	it("returns sessions oldest first with the best weight and reps", () => {
		const result = buildExerciseProgress(exercises, [
			{
				exerciseId: "bench",
				workoutId: "w2",
				endDate: new Date("2026-02-01T10:00:00Z"),
				sets: [logged(8, 62.5), logged(10, 60)],
			},
			{
				exerciseId: "bench",
				workoutId: "w1",
				endDate: new Date("2026-01-01T10:00:00Z"),
				sets: [logged(10, 60)],
			},
		]);

		assert.deepEqual(
			result[0]?.sessions.map(({ workoutId, maxWeight, maxReps }) => ({
				workoutId,
				maxWeight,
				maxReps,
			})),
			[
				{ workoutId: "w1", maxWeight: 60, maxReps: 10 },
				{ workoutId: "w2", maxWeight: 62.5, maxReps: 10 },
			],
		);
	});

	it("sums weight × reps over the logged working sets as volume", () => {
		const result = buildExerciseProgress(exercises, [
			{
				exerciseId: "bench",
				workoutId: "w1",
				endDate: new Date("2026-01-01T10:00:00Z"),
				sets: [
					logged(10, 60),
					logged(8, 62.5),
					logged(15, 20, true),
					{ reps: 12, weight: 100, time: null, isWarmup: false },
				],
			},
		]);

		assert.equal(result[0]?.sessions[0]?.volume, 1100);
	});

	it("ignores warm-up sets and sets without a completion time", () => {
		const result = buildExerciseProgress(exercises, [
			{
				exerciseId: "bench",
				workoutId: "w1",
				endDate: new Date("2026-01-01T10:00:00Z"),
				sets: [logged(15, 20, true), { reps: 12, weight: 100, time: null, isWarmup: false }],
			},
		]);

		assert.deepEqual(result[0]?.sessions, []);
	});

	it("passes the exercise image through", () => {
		const result = buildExerciseProgress(exercises, []);

		assert.equal(result[0]?.imageUrl, "https://example.com/bench.jpg");
		assert.equal(result[1]?.imageUrl, null);
	});

	it("keeps exercises without history and treats a missing weight as 0", () => {
		const result = buildExerciseProgress(exercises, [
			{
				exerciseId: "squat",
				workoutId: "w1",
				endDate: new Date("2026-01-01T10:00:00Z"),
				sets: [logged(20, null)],
			},
		]);

		assert.equal(result[0]?.sessions.length, 0);
		assert.equal(result[1]?.sessions[0]?.maxWeight, 0);
		assert.equal(result[1]?.sessions[0]?.maxReps, 20);
	});
});
