-- AlterTable
ALTER TABLE "program" ADD COLUMN     "groupId" TEXT;

-- CreateTable
CREATE TABLE "program_group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_group_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "program_group_userId_idx" ON "program_group"("userId");

-- AddForeignKey
ALTER TABLE "program_group" ADD CONSTRAINT "program_group_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program" ADD CONSTRAINT "program_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "program_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
