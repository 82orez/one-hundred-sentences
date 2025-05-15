/*
  Warnings:

  - Added the required column `courseId` to the `YouTubeViewAttempt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "YouTubeViewAttempt" ADD COLUMN     "courseId" TEXT NOT NULL;
