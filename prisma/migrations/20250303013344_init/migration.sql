/*
  Warnings:

  - The primary key for the `Sentence` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "CompletedSentence" DROP CONSTRAINT "CompletedSentence_sentenceId_fkey";

-- DropForeignKey
ALTER TABLE "QuizAttempt" DROP CONSTRAINT "QuizAttempt_sentenceId_fkey";

-- AlterTable
ALTER TABLE "CompletedSentence" ALTER COLUMN "sentenceId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "QuizAttempt" ALTER COLUMN "sentenceId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Sentence" DROP CONSTRAINT "Sentence_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Sentence_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Sentence_id_seq";

-- AddForeignKey
ALTER TABLE "CompletedSentence" ADD CONSTRAINT "CompletedSentence_sentenceId_fkey" FOREIGN KEY ("sentenceId") REFERENCES "Sentence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_sentenceId_fkey" FOREIGN KEY ("sentenceId") REFERENCES "Sentence"("id") ON DELETE CASCADE ON UPDATE CASCADE;
