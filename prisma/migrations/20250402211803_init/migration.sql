/*
  Warnings:

  - The `kind` column on the `QuizAttempt` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "QuizAttempt_sentenceNo_idx";

-- DropIndex
DROP INDEX "QuizAttempt_userId_idx";

-- AlterTable
ALTER TABLE "QuizAttempt" ALTER COLUMN "attempt" DROP NOT NULL,
ALTER COLUMN "attempt" DROP DEFAULT,
DROP COLUMN "kind",
ADD COLUMN     "kind" TEXT,
ALTER COLUMN "correct" DROP NOT NULL,
ALTER COLUMN "correct" DROP DEFAULT;

-- DropEnum
DROP TYPE "Kind";
