-- CreateTable
CREATE TABLE "program_to_exercise" (
    "programId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "program_to_exercise_pkey" PRIMARY KEY ("programId","exerciseId")
);

-- AddForeignKey
ALTER TABLE "program_to_exercise" ADD CONSTRAINT "program_to_exercise_programId_fkey" FOREIGN KEY ("programId") REFERENCES "program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_to_exercise" ADD CONSTRAINT "program_to_exercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
