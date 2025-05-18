/*
  Warnings:

  - Added the required column `courseId` to the `favoriteSentence` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "favoriteSentence" ADD COLUMN     "courseId" TEXT NOT NULL;
