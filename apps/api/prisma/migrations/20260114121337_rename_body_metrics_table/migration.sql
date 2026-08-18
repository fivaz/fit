/*
  Warnings:

  - You are about to drop the `BodyMetric` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BodyMetric" DROP CONSTRAINT "BodyMetric_userId_fkey";

-- DropTable
DROP TABLE "BodyMetric";

-- CreateTable
CREATE TABLE "body_metrics" (
    "id" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "bodyFat" DOUBLE PRECISION,
    "muscleMass" DOUBLE PRECISION,
    "visceralFat" INTEGER,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "body_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "body_metrics_userId_date_idx" ON "body_metrics"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "body_metrics_userId_date_key" ON "body_metrics"("userId", "date");

-- AddForeignKey
ALTER TABLE "body_metrics" ADD CONSTRAINT "body_metrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
