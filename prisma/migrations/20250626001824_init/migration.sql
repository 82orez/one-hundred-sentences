/*
  Warnings:

  - A unique constraint covering the columns `[no]` on the table `Sentence` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Sentence_contents_idx";

-- DropIndex
DROP INDEX "Sentence_contents_no_key";

-- CreateIndex
CREATE UNIQUE INDEX "Sentence_no_key" ON "Sentence"("no");

-- AddForeignKey
ALTER TABLE "CompletedSentence" ADD CONSTRAINT "CompletedSentence_sentenceNo_fkey" FOREIGN KEY ("sentenceNo") REFERENCES "Sentence"("no") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteSentence" ADD CONSTRAINT "FavoriteSentence_sentenceNo_fkey" FOREIGN KEY ("sentenceNo") REFERENCES "Sentence"("no") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_sentenceNo_fkey" FOREIGN KEY ("sentenceNo") REFERENCES "Sentence"("no") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NativeAudioAttempt" ADD CONSTRAINT "NativeAudioAttempt_sentenceNo_fkey" FOREIGN KEY ("sentenceNo") REFERENCES "Sentence"("no") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recordings" ADD CONSTRAINT "Recordings_sentenceNo_fkey" FOREIGN KEY ("sentenceNo") REFERENCES "Sentence"("no") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YouTubeViewAttempt" ADD CONSTRAINT "YouTubeViewAttempt_sentenceNo_fkey" FOREIGN KEY ("sentenceNo") REFERENCES "Sentence"("no") ON DELETE CASCADE ON UPDATE CASCADE;
