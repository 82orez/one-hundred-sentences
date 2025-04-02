/*
  Warnings:

  - You are about to drop the column `sentenceId` on the `QuizAttempt` table. All the data in the column will be lost.
  - The `correct` column on the `QuizAttempt` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `sentenceNo` to the `QuizAttempt` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Kind" AS ENUM ('speaking', 'dictation');

-- DropForeignKey
ALTER TABLE "QuizAttempt" DROP CONSTRAINT "QuizAttempt_sentenceId_fkey";

-- AlterTable
ALTER TABLE "QuizAttempt" DROP COLUMN "sentenceId",
ADD COLUMN     "attempt" INTEGER,
ADD COLUMN     "kind" "Kind" NOT NULL DEFAULT 'speaking',
ADD COLUMN     "sentenceNo" TEXT NOT NULL,
DROP COLUMN "correct",
ADD COLUMN     "correct" INTEGER;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_sentenceNo_fkey" FOREIGN KEY ("sentenceNo") REFERENCES "Sentence"("id") ON DELETE CASCADE ON UPDATE CASCADE;
