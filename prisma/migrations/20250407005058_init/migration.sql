/*
  Warnings:

  - You are about to drop the column `favorite` on the `CompletedSentence` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CompletedSentence" DROP COLUMN "favorite";

-- CreateTable
CREATE TABLE "favoriteSentence" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sentenceNo" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favoriteSentence_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "favoriteSentence" ADD CONSTRAINT "favoriteSentence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoriteSentence" ADD CONSTRAINT "favoriteSentence_sentenceNo_fkey" FOREIGN KEY ("sentenceNo") REFERENCES "Sentence"("no") ON DELETE CASCADE ON UPDATE CASCADE;
