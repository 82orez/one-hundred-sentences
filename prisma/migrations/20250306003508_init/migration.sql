/*
  Warnings:

  - A unique constraint covering the columns `[userId,sentenceNo]` on the table `Recordings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sentenceNo` to the `Recordings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Recordings" ADD COLUMN     "sentenceNo" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Recordings_userId_sentenceNo_key" ON "Recordings"("userId", "sentenceNo");

-- AddForeignKey
ALTER TABLE "Recordings" ADD CONSTRAINT "Recordings_sentenceNo_fkey" FOREIGN KEY ("sentenceNo") REFERENCES "Sentence"("no") ON DELETE CASCADE ON UPDATE CASCADE;
