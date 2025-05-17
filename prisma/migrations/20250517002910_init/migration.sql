/*
  Warnings:

  - A unique constraint covering the columns `[userId,courseId,sentenceNo]` on the table `Recordings` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Recordings_userId_sentenceNo_key";

-- CreateIndex
CREATE UNIQUE INDEX "Recordings_userId_courseId_sentenceNo_key" ON "Recordings"("userId", "courseId", "sentenceNo");
