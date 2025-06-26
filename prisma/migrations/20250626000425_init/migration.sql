/*
  Warnings:

  - A unique constraint covering the columns `[contents,no]` on the table `Sentence` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "CompletedSentence" DROP CONSTRAINT "CompletedSentence_sentenceNo_fkey";

-- DropForeignKey
ALTER TABLE "FavoriteSentence" DROP CONSTRAINT "FavoriteSentence_sentenceNo_fkey";

-- DropForeignKey
ALTER TABLE "NativeAudioAttempt" DROP CONSTRAINT "NativeAudioAttempt_sentenceNo_fkey";

-- DropForeignKey
ALTER TABLE "QuizAttempt" DROP CONSTRAINT "QuizAttempt_sentenceNo_fkey";

-- DropForeignKey
ALTER TABLE "Recordings" DROP CONSTRAINT "Recordings_sentenceNo_fkey";

-- DropForeignKey
ALTER TABLE "YouTubeViewAttempt" DROP CONSTRAINT "YouTubeViewAttempt_sentenceNo_fkey";

-- DropIndex
DROP INDEX "Sentence_no_key";

-- CreateIndex
CREATE INDEX "Sentence_contents_idx" ON "Sentence"("contents");

-- CreateIndex
CREATE UNIQUE INDEX "Sentence_contents_no_key" ON "Sentence"("contents", "no");
