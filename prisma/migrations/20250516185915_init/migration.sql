/*
  Warnings:

  - Added the required column `courseId` to the `Recordings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Recordings" ADD COLUMN     "courseId" TEXT NOT NULL;
