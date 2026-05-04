import { addMinutes, subMilliseconds } from "date-fns";

import { MuscleGroup, Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

async function safeDelete(modelDelete: () => Promise<unknown>) {
	try {
		await modelDelete();
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
			console.warn("⚠️ Table not found, skipping delete.");
		} else {
			throw error;
		}
	}
}

/** Calendar day at UTC midnight for `BodyMetric.date` (@db.Date). */
function utcDateOnly(daysAgo: number): Date {
	const now = new Date();
	const utcMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
	return subMilliseconds(new Date(utcMidnight), daysAgo * 86_400_000);
}

type ExerciseSeed = {
	name: string;
	muscles: MuscleGroup[];
	imageUrl?: string;
	bodyPart?: string;
	equipment?: string;
	target?: string;
	secondaryMuscles?: string[];
	instructions?: string[];
	description?: string;
	difficulty?: string;
	category?: string;
};

async function main() {
	const DEV_USER_ID = "demo-user-id";
	const DEV_ACCOUNT_ID = "account-123";
	const EMAIL = "test@test.com";

	console.log("🚀 Starting seed...");

	// --- 1️⃣ Cleanup ---
	console.log("🧹 Cleaning up existing data...");
	await safeDelete(() => prisma.set.deleteMany());
	await safeDelete(() => prisma.workoutExercise.deleteMany());
	await safeDelete(() => prisma.workout.deleteMany());
	await safeDelete(() => prisma.programToExercise.deleteMany());
	await safeDelete(() => prisma.exercise.deleteMany());
	await safeDelete(() => prisma.program.deleteMany());
	await safeDelete(() => prisma.bodyMetric.deleteMany());
	await safeDelete(() => prisma.account.deleteMany());
	await safeDelete(() => prisma.user.deleteMany());

	console.log("👤 Creating Test user...");
	// --- 2️⃣ Create or upsert user ---
	const user = await prisma.user.upsert({
		where: { id: DEV_USER_ID },
		update: {},
		create: {
			id: DEV_USER_ID,
			name: "Demo User",
			email: EMAIL,
			emailVerified: true,
			timezone: "America/New_York",
		},
	});

	// --- 3️⃣ Create or upsert account ---
	await prisma.account.upsert({
		where: { id: DEV_ACCOUNT_ID },
		update: {},
		create: {
			id: DEV_ACCOUNT_ID,
			userId: user.id,
			accountId: EMAIL,
			providerId: "credential",
			password:
				"572915f247a8c5c4be56201a48bad84f:0b983fe1a6c3b51a9207c10d21e02f74606803844806e8d45f39e80ccb7b4529108cdc21b24488ae6a5ce60d61b9a2cf94294e20a50525903c0bd05aa07006ca",
		},
	});

	console.log("🏋️ Creating exercises...");

	const exerciseDefs: ExerciseSeed[] = [
		// Push
		{
			name: "Bench Press",
			muscles: [MuscleGroup.chest, MuscleGroup.triceps, MuscleGroup.shoulders],
			imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400",
			bodyPart: "chest",
			equipment: "barbell",
			target: "pectorals",
			secondaryMuscles: ["anterior deltoid", "triceps"],
			instructions: [
				"Lie flat on the bench with feet planted.",
				"Grip the bar slightly wider than shoulder width, unrack with straight arms.",
				"Lower to mid-chest with control, pause, then press up while keeping wrists stacked.",
			],
			description: "Primary horizontal press for chest and triceps.",
			difficulty: "intermediate",
			category: "strength",
		},
		{
			name: "Overhead Press",
			muscles: [MuscleGroup.shoulders, MuscleGroup.triceps, MuscleGroup.traps],
			imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400",
			bodyPart: "shoulders",
			equipment: "barbell",
			target: "delts",
			secondaryMuscles: ["triceps", "upper chest"],
			instructions: [
				"Stand with bar at collarbone, elbows under wrists.",
				"Brace core and glutes; press straight up, moving head slightly back then through.",
				"Lock out overhead without shrugging hard into ears.",
			],
			description: "Vertical press for shoulders and triceps.",
			difficulty: "intermediate",
			category: "strength",
		},
		{
			name: "Tricep Rope Pushdown",
			muscles: [MuscleGroup.triceps],
			imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400",
			bodyPart: "upper arms",
			equipment: "cable",
			target: "triceps",
			secondaryMuscles: [],
			instructions: [
				"Attach rope to high pulley, elbows pinned to sides.",
				"Extend elbows and split the rope at the bottom for a strong contraction.",
				"Control the return without letting shoulders roll forward.",
			],
			description: "Isolation for triceps; good finisher after presses.",
			difficulty: "beginner",
			category: "isolation",
		},
		// Pull
		{
			name: "Pull Ups",
			muscles: [MuscleGroup.back, MuscleGroup.biceps],
			imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400",
			bodyPart: "back",
			equipment: "body weight",
			target: "lats",
			secondaryMuscles: ["biceps", "rear delt"],
			instructions: [
				"Hang from bar with full grip, shoulders slightly packed.",
				"Pull chest toward bar without excessive swinging.",
				"Lower with control to full hang.",
			],
			description: "Vertical pull pattern; add band or weight as needed.",
			difficulty: "intermediate",
			category: "strength",
		},
		{
			name: "Barbell Row",
			muscles: [MuscleGroup.back, MuscleGroup.biceps, MuscleGroup.forearms],
			imageUrl: "https://images.unsplash.com/photo-1603287681836-b57ce35e8c73?w=400",
			bodyPart: "back",
			equipment: "barbell",
			target: "lats",
			secondaryMuscles: ["rhomboids", "rear delt"],
			instructions: [
				"Hinge at hips with neutral spine, bar hanging under shoulders.",
				"Row bar toward lower ribs, squeezing shoulder blades.",
				"Lower without rounding the low back.",
			],
			description: "Heavy horizontal pull for mid-back thickness.",
			difficulty: "intermediate",
			category: "strength",
		},
		{
			name: "Hammer Curl",
			muscles: [MuscleGroup.biceps, MuscleGroup.forearms],
			imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2cfe61?w=400",
			bodyPart: "upper arms",
			equipment: "dumbbell",
			target: "biceps",
			secondaryMuscles: ["brachialis", "brachioradialis"],
			instructions: [
				"Neutral grip dumbbells at sides.",
				"Curl without letting elbows drift forward or shrugging.",
				"Lower slowly to full extension.",
			],
			description: "Neutral-grip curl bias for brachialis and arms overall.",
			difficulty: "beginner",
			category: "isolation",
		},
		// Legs
		{
			name: "Barbell Squats",
			muscles: [MuscleGroup.quads, MuscleGroup.glutes],
			imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400",
			bodyPart: "upper legs",
			equipment: "barbell",
			target: "quads",
			secondaryMuscles: ["glutes", "adductors"],
			instructions: [
				"Bar on upper back, feet shoulder-width, toes slightly out.",
				"Break at hips and knees together, depth as mobility allows.",
				"Drive up through mid-foot while keeping chest tall.",
			],
			description: "Primary squat pattern for legs and trunk strength.",
			difficulty: "intermediate",
			category: "strength",
		},
		{
			name: "Romanian Deadlift",
			muscles: [MuscleGroup.hamstrings, MuscleGroup.glutes, MuscleGroup.back],
			imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400",
			bodyPart: "upper legs",
			equipment: "barbell",
			target: "hamstrings",
			secondaryMuscles: ["glutes", "erectors"],
			instructions: [
				"Soft bend in knees, hinge hips back while sliding bar down legs.",
				"Feel stretch in hamstrings before reversing to stand tall.",
				"Keep bar close and spine neutral throughout.",
			],
			description: "Hinge pattern emphasizing hamstrings and glutes.",
			difficulty: "intermediate",
			category: "strength",
		},
		{
			name: "Standing Calf Raise",
			muscles: [MuscleGroup.calves],
			imageUrl: "https://images.unsplash.com/photo-1434608519344-49f77edb84cc?w=400",
			bodyPart: "lower legs",
			equipment: "machine",
			target: "gastrocnemius",
			secondaryMuscles: ["soleus"],
			instructions: [
				"Stand on balls of feet with full range at bottom.",
				"Rise as high as possible, pause, lower slowly.",
				"Avoid bouncing out of the bottom.",
			],
			description: "Isolation for calves; use smith or dedicated machine.",
			difficulty: "beginner",
			category: "isolation",
		},
	];

	const exercises = await Promise.all(
		exerciseDefs.map((def) =>
			prisma.exercise.create({
				data: {
					...def,
					userId: user.id,
				},
			}),
		),
	);

	const [bench, ohp, pushdown, pullUps, row, hammerCurl, squat, rdl, calfRaise] = exercises;

	console.log("📋 Creating programs (3 exercises each)...");

	const pushDay = await prisma.program.create({
		data: {
			name: "Push Day",
			order: 0,
			userId: user.id,
			imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&q=80",
			muscles: [MuscleGroup.chest, MuscleGroup.shoulders, MuscleGroup.triceps],
		},
	});

	const pullDay = await prisma.program.create({
		data: {
			name: "Pull Day",
			order: 1,
			userId: user.id,
			imageUrl: "https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=800&q=80",
			muscles: [MuscleGroup.back, MuscleGroup.biceps, MuscleGroup.forearms],
		},
	});

	const legDay = await prisma.program.create({
		data: {
			name: "Leg Day",
			order: 2,
			userId: user.id,
			imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
			muscles: [MuscleGroup.quads, MuscleGroup.hamstrings, MuscleGroup.glutes],
		},
	});

	await prisma.programToExercise.createMany({
		data: [
			{ programId: pushDay.id, exerciseId: bench.id, order: 0 },
			{ programId: pushDay.id, exerciseId: ohp.id, order: 1 },
			{ programId: pushDay.id, exerciseId: pushdown.id, order: 2 },
			{ programId: pullDay.id, exerciseId: pullUps.id, order: 0 },
			{ programId: pullDay.id, exerciseId: row.id, order: 1 },
			{ programId: pullDay.id, exerciseId: hammerCurl.id, order: 2 },
			{ programId: legDay.id, exerciseId: squat.id, order: 0 },
			{ programId: legDay.id, exerciseId: rdl.id, order: 1 },
			{ programId: legDay.id, exerciseId: calfRaise.id, order: 2 },
		],
	});

	console.log("📊 Seeding body metrics (settings / charts)...");
	const bodyRows = [0, 1, 2, 3, 4, 5, 6].map((daysAgo) => ({
		userId: user.id,
		date: utcDateOnly(daysAgo),
		weight: 78.4 + daysAgo * 0.15 - (daysAgo % 3) * 0.3,
		bodyFat: 16.2 - daysAgo * 0.05 + (daysAgo % 2) * 0.1,
		muscleMass: 34.1 + daysAgo * 0.02,
		visceralFat: 7 + (daysAgo % 4),
	}));
	await prisma.bodyMetric.createMany({ data: bodyRows });

	console.log("📜 Seeding historical workouts (progress + prefill)...");

	const daysAgo = (n: number) => {
		const now = new Date();
		const utcMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
		const dayStart = subMilliseconds(new Date(utcMidnight), n * 86_400_000);
		return addMinutes(dayStart, 9 * 60 + 30);
	};

	// Finished push — 6 days ago: warmups, working sets, mixed timestamps
	const pushStart = daysAgo(6);
	const pushEnd = addMinutes(pushStart, 62);
	await prisma.workout.create({
		data: {
			userId: user.id,
			programId: pushDay.id,
			startDate: pushStart,
			endDate: pushEnd,
			exercises: {
				create: [
					{
						exerciseId: bench.id,
						order: 0,
						sets: {
							create: [
								{ order: 0, reps: 12, weight: 20, isWarmup: true, time: addMinutes(pushStart, 5) },
								{ order: 1, reps: 8, weight: 50, isWarmup: true, time: addMinutes(pushStart, 8) },
								{
									order: 2,
									reps: 8,
									weight: 72.5,
									isWarmup: false,
									time: addMinutes(pushStart, 14),
								},
								{
									order: 3,
									reps: 8,
									weight: 72.5,
									isWarmup: false,
									time: addMinutes(pushStart, 20),
								},
								{ order: 4, reps: 6, weight: 75, isWarmup: false, time: addMinutes(pushStart, 28) },
							],
						},
					},
					{
						exerciseId: ohp.id,
						order: 1,
						sets: {
							create: [
								{ order: 0, reps: 10, weight: 30, isWarmup: true, time: addMinutes(pushStart, 35) },
								{ order: 1, reps: 8, weight: 45, isWarmup: false, time: addMinutes(pushStart, 40) },
								{ order: 2, reps: 8, weight: 45, isWarmup: false, time: addMinutes(pushStart, 46) },
								{ order: 3, reps: 7, weight: 45, isWarmup: false, time: addMinutes(pushStart, 52) },
							],
						},
					},
					{
						exerciseId: pushdown.id,
						order: 2,
						sets: {
							create: [
								{ order: 0, reps: 15, weight: 15, isWarmup: true, time: addMinutes(pushStart, 56) },
								{
									order: 1,
									reps: 12,
									weight: 22.5,
									isWarmup: false,
									time: addMinutes(pushStart, 58),
								},
								{
									order: 2,
									reps: 12,
									weight: 22.5,
									isWarmup: false,
									time: addMinutes(pushStart, 60),
								},
							],
						},
					},
				],
			},
		},
	});

	// Finished pull — 4 days ago: includes null weight (bodyweight pull-ups)
	const pullStart = daysAgo(4);
	const pullEnd = addMinutes(pullStart, 55);
	await prisma.workout.create({
		data: {
			userId: user.id,
			programId: pullDay.id,
			startDate: pullStart,
			endDate: pullEnd,
			exercises: {
				create: [
					{
						exerciseId: pullUps.id,
						order: 0,
						sets: {
							create: [
								{ order: 0, reps: 5, weight: null, isWarmup: true, time: addMinutes(pullStart, 4) },
								{
									order: 1,
									reps: 8,
									weight: null,
									isWarmup: false,
									time: addMinutes(pullStart, 8),
								},
								{
									order: 2,
									reps: 7,
									weight: null,
									isWarmup: false,
									time: addMinutes(pullStart, 12),
								},
								{
									order: 3,
									reps: 6,
									weight: null,
									isWarmup: false,
									time: addMinutes(pullStart, 16),
								},
							],
						},
					},
					{
						exerciseId: row.id,
						order: 1,
						sets: {
							create: [
								{ order: 0, reps: 10, weight: 40, isWarmup: true, time: addMinutes(pullStart, 22) },
								{
									order: 1,
									reps: 10,
									weight: 60,
									isWarmup: false,
									time: addMinutes(pullStart, 28),
								},
								{
									order: 2,
									reps: 10,
									weight: 65,
									isWarmup: false,
									time: addMinutes(pullStart, 34),
								},
								{ order: 3, reps: 8, weight: 65, isWarmup: false, time: addMinutes(pullStart, 40) },
							],
						},
					},
					{
						exerciseId: hammerCurl.id,
						order: 2,
						sets: {
							create: [
								{
									order: 0,
									reps: 12,
									weight: 12,
									isWarmup: false,
									time: addMinutes(pullStart, 46),
								},
								{
									order: 1,
									reps: 12,
									weight: 12,
									isWarmup: false,
									time: addMinutes(pullStart, 50),
								},
								{
									order: 2,
									reps: 10,
									weight: 14,
									isWarmup: false,
									time: addMinutes(pullStart, 54),
								},
							],
						},
					},
				],
			},
		},
	});

	// Finished leg — 1 day ago: second leg session for “last session” UX
	const legStart = daysAgo(1);
	const legEnd = addMinutes(legStart, 58);
	await prisma.workout.create({
		data: {
			userId: user.id,
			programId: legDay.id,
			startDate: legStart,
			endDate: legEnd,
			exercises: {
				create: [
					{
						exerciseId: squat.id,
						order: 0,
						sets: {
							create: [
								{ order: 0, reps: 10, weight: 40, isWarmup: true, time: addMinutes(legStart, 6) },
								{ order: 1, reps: 8, weight: 80, isWarmup: true, time: addMinutes(legStart, 10) },
								{ order: 2, reps: 5, weight: 110, isWarmup: false, time: addMinutes(legStart, 16) },
								{ order: 3, reps: 5, weight: 110, isWarmup: false, time: addMinutes(legStart, 22) },
								{
									order: 4,
									reps: 5,
									weight: 112.5,
									isWarmup: false,
									time: addMinutes(legStart, 28),
								},
							],
						},
					},
					{
						exerciseId: rdl.id,
						order: 1,
						sets: {
							create: [
								{ order: 0, reps: 8, weight: 60, isWarmup: false, time: addMinutes(legStart, 34) },
								{ order: 1, reps: 8, weight: 70, isWarmup: false, time: addMinutes(legStart, 40) },
								{ order: 2, reps: 8, weight: 70, isWarmup: false, time: addMinutes(legStart, 46) },
							],
						},
					},
					{
						exerciseId: calfRaise.id,
						order: 2,
						sets: {
							create: [
								{ order: 0, reps: 15, weight: 45, isWarmup: false, time: addMinutes(legStart, 50) },
								{ order: 1, reps: 15, weight: 45, isWarmup: false, time: addMinutes(legStart, 54) },
								{ order: 2, reps: 12, weight: 55, isWarmup: false, time: addMinutes(legStart, 57) },
							],
						},
					},
				],
			},
		},
	});

	console.log("✅ Seed completed: programs (3×3 exercises), body metrics, 3 finished workouts.");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
