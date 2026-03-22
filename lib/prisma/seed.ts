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

	console.log("🏋️ Creating Exercises...");

	// --- 4️⃣ Create exercises ---
	const benchPress = await prisma.exercise.create({
		data: {
			name: "Bench Press",
			userId: user.id,
			muscles: [MuscleGroup.chest, MuscleGroup.triceps],
			imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400",
		},
	});

	const pullUps = await prisma.exercise.create({
		data: {
			name: "Pull Ups",
			userId: user.id,
			muscles: [MuscleGroup.back, MuscleGroup.biceps],
			imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400",
		},
	});

	const squats = await prisma.exercise.create({
		data: {
			name: "Barbell Squats",
			userId: user.id,
			muscles: [MuscleGroup.quads, MuscleGroup.glutes],
			imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400",
		},
	});

	console.log("📋 Creating Programs...");

	// --- 5️⃣ Create programs with exercises via ProgramToExercise ---
	const pushDay = await prisma.program.create({
		data: {
			name: "Push Day",
			userId: user.id,
			imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&q=80",
			muscles: [MuscleGroup.chest, MuscleGroup.shoulders, MuscleGroup.triceps],
		},
	});

	await prisma.programToExercise.create({
		data: { programId: pushDay.id, exerciseId: benchPress.id, order: 0 },
	});

	const pullDay = await prisma.program.create({
		data: {
			name: "Pull Day",
			userId: user.id,
			imageUrl: "https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=800&q=80",
			muscles: [MuscleGroup.back, MuscleGroup.biceps, MuscleGroup.forearms],
		},
	});

	await prisma.programToExercise.create({
		data: { programId: pullDay.id, exerciseId: pullUps.id, order: 0 },
	});

	const legDay = await prisma.program.create({
		data: {
			name: "Leg Day",
			userId: user.id,
			imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
			muscles: [MuscleGroup.quads, MuscleGroup.hamstrings, MuscleGroup.glutes],
		},
	});

	await prisma.programToExercise.create({
		data: { programId: legDay.id, exerciseId: squats.id, order: 0 },
	});

	// --- 6️⃣ Create a History Item (For testing your boilerplate logic) ---
	console.log("📜 Seeding historical workout data...");

	const pastDate = new Date();
	pastDate.setDate(pastDate.getDate() - 2);

	// await prisma.workout.create({
	// 	data: {
	// 		userId: user.id,
	// 		programId: pushDay.id,
	// 		startDate: pastDate,
	// 		endDate: new Date(pastDate.getTime() + 3600000),
	// 		exercises: {
	// 			create: {
	// 				exerciseId: benchPress.id,
	// 				order: 0,
	// 				sets: {
	// 					create: [
	// 						{ order: 0, reps: 10, weight: 60, time: new Date(pastDate.getTime() + 600000) },
	// 						{ order: 1, reps: 10, weight: 60, time: new Date(pastDate.getTime() + 900000) },
	// 						{ order: 2, reps: 8, weight: 65, time: new Date(pastDate.getTime() + 1200000) },
	// 					],
	// 				},
	// 			},
	// 		},
	// 	},
	// });

	console.log("✅ Seed completed: Push, Pull, and Leg days are ready.");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
