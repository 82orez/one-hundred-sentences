/*
  Warnings:

  - Added the required column `courseId` to the `UserNextDay` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserNextDay" ADD COLUMN     "courseId" TEXT NOT NULL;
