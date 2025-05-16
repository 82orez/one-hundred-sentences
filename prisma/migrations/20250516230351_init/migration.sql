/*
  Warnings:

  - A unique constraint covering the columns `[userId,courseId,sentenceNo]` on the table `CompletedSentence` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `courseId` to the `CompletedSentence` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CompletedSentence_userId_sentenceNo_key";

-- AlterTable
ALTER TABLE "CompletedSentence" ADD COLUMN     "courseId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CompletedSentence_userId_courseId_sentenceNo_key" ON "CompletedSentence"("userId", "courseId", "sentenceNo");
