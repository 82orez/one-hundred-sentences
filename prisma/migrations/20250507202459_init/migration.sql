/*
  Warnings:

  - Added the required column `courseTitle` to the `Enrollment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "courseTitle" TEXT NOT NULL;
