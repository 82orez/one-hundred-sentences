/*
  Warnings:

  - Added the required column `studentName` to the `Enrollment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentPhone` to the `Enrollment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "studentName" TEXT NOT NULL,
ADD COLUMN     "studentPhone" TEXT NOT NULL,
ALTER COLUMN "studentId" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'pending';
