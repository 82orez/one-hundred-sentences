/*
  Warnings:

  - You are about to drop the `LearningProgress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LearningProgress" DROP CONSTRAINT "LearningProgress_sentenceId_fkey";

-- DropForeignKey
ALTER TABLE "LearningProgress" DROP CONSTRAINT "LearningProgress_userId_fkey";

-- DropTable
DROP TABLE "LearningProgress";

-- CreateTable
CREATE TABLE "CompletedSentence" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sentenceId" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompletedSentence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompletedSentence_userId_sentenceId_key" ON "CompletedSentence"("userId", "sentenceId");

-- AddForeignKey
ALTER TABLE "CompletedSentence" ADD CONSTRAINT "CompletedSentence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompletedSentence" ADD CONSTRAINT "CompletedSentence_sentenceId_fkey" FOREIGN KEY ("sentenceId") REFERENCES "Sentence"("id") ON DELETE CASCADE ON UPDATE CASCADE;
