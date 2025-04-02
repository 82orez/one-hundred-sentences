/*
  Warnings:

  - You are about to drop the column `attemptedAt` on the `QuizAttempt` table. All the data in the column will be lost.
  - Made the column `attempt` on table `QuizAttempt` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `sentenceNo` on the `QuizAttempt` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `correct` on table `QuizAttempt` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "QuizAttempt" DROP CONSTRAINT "QuizAttempt_sentenceNo_fkey";

-- AlterTable
ALTER TABLE "QuizAttempt" DROP COLUMN "attemptedAt",
ALTER COLUMN "attempt" SET NOT NULL,
ALTER COLUMN "attempt" SET DEFAULT 0,
DROP COLUMN "sentenceNo",
ADD COLUMN     "sentenceNo" INTEGER NOT NULL,
ALTER COLUMN "correct" SET NOT NULL,
ALTER COLUMN "correct" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "QuizAttempt_userId_idx" ON "QuizAttempt"("userId");

-- CreateIndex
CREATE INDEX "QuizAttempt_sentenceNo_idx" ON "QuizAttempt"("sentenceNo");

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_sentenceNo_fkey" FOREIGN KEY ("sentenceNo") REFERENCES "Sentence"("no") ON DELETE CASCADE ON UPDATE CASCADE;
