/*
  Warnings:

  - You are about to drop the column `sentenceId` on the `CompletedSentence` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,sentenceNo]` on the table `CompletedSentence` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sentenceNo` to the `CompletedSentence` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CompletedSentence" DROP CONSTRAINT "CompletedSentence_sentenceId_fkey";

-- DropIndex
DROP INDEX "CompletedSentence_userId_sentenceId_key";

-- AlterTable
ALTER TABLE "CompletedSentence" DROP COLUMN "sentenceId",
ADD COLUMN     "sentenceNo" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CompletedSentence_userId_sentenceNo_key" ON "CompletedSentence"("userId", "sentenceNo");

-- AddForeignKey
ALTER TABLE "CompletedSentence" ADD CONSTRAINT "CompletedSentence_sentenceNo_fkey" FOREIGN KEY ("sentenceNo") REFERENCES "Sentence"("no") ON DELETE CASCADE ON UPDATE CASCADE;
