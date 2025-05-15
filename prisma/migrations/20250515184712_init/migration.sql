/*
  Warnings:

  - Added the required column `courseId` to the `NativeAudioAttempt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NativeAudioAttempt" ADD COLUMN     "courseId" TEXT NOT NULL;
