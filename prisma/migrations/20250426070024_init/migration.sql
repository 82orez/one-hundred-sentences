/*
  Warnings:

  - You are about to drop the column `classDates` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "classDates";

-- CreateTable
CREATE TABLE "ClassDate" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassDate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClassDate_courseId_idx" ON "ClassDate"("courseId");

-- AddForeignKey
ALTER TABLE "ClassDate" ADD CONSTRAINT "ClassDate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
