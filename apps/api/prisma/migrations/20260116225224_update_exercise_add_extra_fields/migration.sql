-- AlterTable
ALTER TABLE "exercise" ADD COLUMN     "bodyPart" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "difficulty" TEXT,
ADD COLUMN     "equipment" TEXT,
ADD COLUMN     "instructions" TEXT[],
ADD COLUMN     "localPath" TEXT,
ADD COLUMN     "secondaryMuscles" TEXT[],
ADD COLUMN     "target" TEXT;
