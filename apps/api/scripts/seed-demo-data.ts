/**
 * Seeds realistic history for the portfolio demo user: three programs (Push/Pull/Legs) built from
 * the shared exercise library, plus ~8 weeks of workouts with progressive overload, so the Progress
 * screens have real data. The UI can't backdate workouts, hence a direct DB script.
 *
 * Usage: pnpm exec tsx scripts/seed-demo-data.ts <email>
 * Refuses to run unless DATABASE_URL points at a local database.
 */
import "../src/load-env.js";

import { type MuscleGroupType } from "@fit/shared";

import { prisma } from "../src/prisma/client.js";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const WEEKS = 8;
/** Warmup sets use this share of the day's working weight. */
const WARMUP_LOAD = 0.6;

type PlannedExercise = { name: string; baseKg: number; weeklyKg: number };
type PlannedProgram = {
	name: string;
	muscles: MuscleGroupType[];
	weekday: number; // 1 = Monday
	exercises: PlannedExercise[];
};

/** Exact names from the shared library (see `pnpm exercises-seed`); the script fails if one is missing. */
const PROGRAMS: PlannedProgram[] = [
	{
		name: "Push Day A",
		muscles: ["chest", "shoulders", "triceps"],
		weekday: 1,
		exercises: [
			{ name: "barbell bench press", baseKg: 60, weeklyKg: 1.25 },
			{ name: "barbell incline bench press", baseKg: 47.5, weeklyKg: 1.25 },
			{ name: "dumbbell standing overhead press", baseKg: 16, weeklyKg: 0.5 },
			{ name: "cable lateral raise", baseKg: 7.5, weeklyKg: 0.25 },
			{ name: "cable pushdown", baseKg: 30, weeklyKg: 0.75 },
		],
	},
	{
		name: "Pull Day A",
		muscles: ["back", "biceps"],
		weekday: 3,
		exercises: [
			{ name: "barbell bent over row", baseKg: 55, weeklyKg: 1.25 },
			{ name: "cable pulldown (pro lat bar)", baseKg: 50, weeklyKg: 1.25 },
			{ name: "barbell curl", baseKg: 30, weeklyKg: 0.75 },
			{ name: "pull-up", baseKg: 0, weeklyKg: 0 },
		],
	},
	{
		name: "Leg Day A",
		muscles: ["quads", "hamstrings", "glutes", "calves"],
		weekday: 5,
		exercises: [
			{ name: "barbell full squat", baseKg: 80, weeklyKg: 2 },
			{ name: "barbell romanian deadlift", baseKg: 70, weeklyKg: 1.5 },
			{ name: "sled 45° leg press", baseKg: 140, weeklyKg: 3 },
			{ name: "lever seated leg curl", baseKg: 40, weeklyKg: 1 },
			{ name: "barbell standing leg calf raise", baseKg: 60, weeklyKg: 1.5 },
		],
	},
];

/** Small deterministic PRNG so re-seeding gives identical charts (no Math.random). */
function seededRandom(seed: number): () => number {
	let state = seed;
	return () => {
		state = (state * 1664525 + 1013904223) % 4294967296;
		return state / 4294967296;
	};
}

function roundToPlate(kg: number): number {
	return Math.round(kg / 1.25) * 1.25;
}

function assertLocalDatabase(): void {
	const url = process.env.DATABASE_URL;
	if (!url) throw new Error("DATABASE_URL is not set");
	const { hostname } = new URL(url);
	if (!LOCAL_HOSTS.has(hostname)) {
		throw new Error(
			`Refusing to seed demo data into a non-local database (host: ${hostname}). ` +
				"Point DATABASE_URL at localhost first.",
		);
	}
}

async function main() {
	const email = process.argv[2];
	if (!email) {
		console.error("Usage: pnpm exec tsx scripts/seed-demo-data.ts <email>");
		process.exit(1);
	}
	assertLocalDatabase();

	const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
	if (!user) throw new Error(`No user found for email=${email}`);

	const names = [...new Set(PROGRAMS.flatMap((program) => program.exercises.map((e) => e.name)))];
	const library = await prisma.exercise.findMany({
		where: { userId: null, name: { in: names } },
		select: { id: true, name: true },
	});
	const idByName = new Map(library.map((exercise) => [exercise.name, exercise.id]));
	const missing = names.filter((name) => !idByName.has(name));
	if (missing.length > 0) {
		throw new Error(
			`Missing from the shared library (run \`pnpm exercises-seed\`): ${missing.join(", ")}`,
		);
	}

	// Idempotent: replace any earlier demo data for this user.
	await prisma.workout.deleteMany({ where: { userId: user.id } });
	await prisma.program.deleteMany({ where: { userId: user.id } });
	await prisma.programGroup.deleteMany({ where: { userId: user.id } }); // e.g. groups from the AI clip

	const group = await prisma.programGroup.create({
		data: { name: "Push Pull Legs", order: 0, userId: user.id },
		select: { id: true },
	});

	const programIds = new Map<string, string>();
	for (const [order, program] of PROGRAMS.entries()) {
		const created = await prisma.program.create({
			data: {
				name: program.name,
				muscles: program.muscles,
				order,
				groupId: group.id,
				userId: user.id,
				exercises: {
					create: program.exercises.map((exercise, exerciseOrder) => ({
						order: exerciseOrder,
						exerciseId: idByName.get(exercise.name) as string,
					})),
				},
			},
			select: { id: true },
		});
		programIds.set(program.name, created.id);
	}

	const random = seededRandom(42);
	const now = new Date();
	const todayUtcMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
	const mondayOffset = (now.getUTCDay() + 6) % 7; // days since Monday
	const thisMonday = todayUtcMidnight - mondayOffset * 86_400_000;

	let workouts = 0;
	for (let week = WEEKS - 1; week >= 0; week -= 1) {
		for (const program of PROGRAMS) {
			const day = thisMonday - week * 7 * 86_400_000 + (program.weekday - 1) * 86_400_000;
			if (day >= todayUtcMidnight) continue; // history only: today's session is recorded live
			if (random() < 0.08) continue; // an occasional missed session looks human

			const weekIndex = WEEKS - 1 - week;
			const start = new Date(day + (17 * 60 + Math.floor(random() * 30)) * 60_000);
			let clock = start.getTime();

			const exercises = program.exercises.map((exercise, order) => {
				// A lighter warmup set, then two working sets. Warmups stay out of the progress charts,
				// so the history lines up with a live session logged the same way.
				const sets = [0, 1, 2].map((setIndex) => {
					clock += (3 + Math.floor(random() * 3)) * 60_000;
					const isWarmup = setIndex === 0;
					const jitter = (random() - 0.5) * 1.25;
					const workingKg = exercise.baseKg + exercise.weeklyKg * weekIndex + jitter;
					const weight =
						exercise.baseKg === 0
							? null
							: roundToPlate(isWarmup ? workingKg * WARMUP_LOAD : workingKg);
					return {
						order: setIndex,
						reps: isWarmup ? 12 : 8 + Math.floor(random() * 3) - (setIndex === 2 ? 1 : 0),
						weight,
						time: new Date(clock),
						isWarmup,
					};
				});
				return { order, exerciseId: idByName.get(exercise.name) as string, sets: { create: sets } };
			});

			await prisma.workout.create({
				data: {
					userId: user.id,
					programId: programIds.get(program.name),
					startDate: start,
					endDate: new Date(clock + 4 * 60_000),
					exercises: { create: exercises },
				},
			});
			workouts += 1;
		}
	}

	console.log(
		`[demo-seed] 1 group, ${PROGRAMS.length} programs, ${workouts} workouts for ${email}`,
	);
}

void main()
	.catch((error) => {
		console.error(error instanceof Error ? error.message : error);
		process.exitCode = 1;
	})
	.finally(() => prisma.$disconnect());
