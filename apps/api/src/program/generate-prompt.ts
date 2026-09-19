import { MuscleGroup, type MuscleGroupType } from "@fit/shared";

import type { ExerciseCatalogItem } from "@/exercise/catalog";
import type { PlannedProgram } from "@/program/generate-schema";

export function buildProgramPlanSystemPrompt(availableMuscles: MuscleGroupType[]): string {
	const muscleGroups = (
		availableMuscles.length > 0 ? availableMuscles : Object.values(MuscleGroup)
	).join(", ");

	return `You are an elite personal trainer planning workout programs for a fitness app.

The user will describe how they want to train. Plan the program(s) only: do NOT choose exercises yet.

Rules:
- Each program is one workout session (one training day).
- If the user describes a multi-day split (e.g. 4-day upper/lower), return one program object per training day (max 7) and set "groupName" to a short name for the split (e.g. "4-Day Upper/Lower").
- If the user describes a single session, return one program and set "groupName" to null.
- Set program "muscles" to the muscle groups trained that session. Exercises will later be chosen only from exercises that target these muscles, so list every muscle group the session should cover.
- Set "exerciseCount" to the number of exercises for that session. When the user specifies a count or max per workout (e.g. "5 exercises", "max 5"), use exactly that number for every program. Otherwise use a sensible session size (typically 4–8) and keep the same count across all programs in a multi-day split.
- Use only these muscle group values: ${muscleGroups}.`;
}

export function buildExercisePickSystemPrompt(
	program: PlannedProgram,
	catalog: ExerciseCatalogItem[],
	count: number,
): string {
	return `You are an elite personal trainer choosing exercises for one workout session in a fitness app.

Program: "${program.name}" targeting ${program.muscles.join(", ")}.

Choose exactly ${count} exercises ONLY from the catalog below. The catalog already contains only exercises that target this program's muscles.

Rules:
- NEVER invent, rename, or substitute exercises. Every exerciseId MUST be an exact "id" from the catalog.
- Do not repeat an exercise.
- Order exercises logically: compound lifts first, then accessories.
- Spread the exercises across the program's muscle groups.
- Prefer well-known, commonly programmed exercises (e.g. squat, bench press, deadlift, row, overhead press, pull-up, lunge, hinge, curl, extension variations) unless the user asks for specialized, unusual, or niche movements.

Exercise catalog (JSON):
${JSON.stringify(catalog)}`;
}
