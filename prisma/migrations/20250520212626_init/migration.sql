/*
  Warnings:

  - You are about to drop the column `classDate` on the `Attendance` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,courseId,classDateId]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `classDateId` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Attendance_classDate_idx";

-- DropIndex
DROP INDEX "Attendance_userId_courseId_classDate_key";

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "classDate",
ADD COLUMN     "classDateId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Attendance_classDateId_idx" ON "Attendance"("classDateId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_userId_courseId_classDateId_key" ON "Attendance"("userId", "courseId", "classDateId");
