/*
  Warnings:

  - A unique constraint covering the columns `[userId,sentenceForBasicNo]` on the table `CompletedSentence` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CompletedSentence" ADD COLUMN     "sentenceForBasicNo" INTEGER,
ALTER COLUMN "sentenceNo" DROP NOT NULL;

-- AlterTable
ALTER TABLE "NativeAudioAttempt" ADD COLUMN     "sentenceForbasicId" TEXT;

-- AlterTable
ALTER TABLE "QuizAttempt" ADD COLUMN     "sentenceForbasicId" TEXT;

-- AlterTable
ALTER TABLE "Recordings" ADD COLUMN     "sentenceForbasicId" TEXT;

-- AlterTable
ALTER TABLE "YouTubeViewAttempt" ADD COLUMN     "sentenceForbasicId" TEXT;

-- AlterTable
ALTER TABLE "favoriteSentence" ADD COLUMN     "sentenceForbasicId" TEXT;

-- CreateTable
CREATE TABLE "SentenceForbasic" (
    "id" TEXT NOT NULL,
    "contents" "Contents" NOT NULL,
    "no" INTEGER NOT NULL,
    "en" TEXT NOT NULL,
    "ko" TEXT NOT NULL,
    "audioUrl" TEXT,
    "utubeUrl" TEXT,

    CONSTRAINT "SentenceForbasic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SentenceForbasic_no_key" ON "SentenceForbasic"("no");

-- CreateIndex
CREATE UNIQUE INDEX "CompletedSentence_userId_sentenceForBasicNo_key" ON "CompletedSentence"("userId", "sentenceForBasicNo");

-- AddForeignKey
ALTER TABLE "CompletedSentence" ADD CONSTRAINT "CompletedSentence_sentenceForBasicNo_fkey" FOREIGN KEY ("sentenceForBasicNo") REFERENCES "SentenceForbasic"("no") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoriteSentence" ADD CONSTRAINT "favoriteSentence_sentenceForbasicId_fkey" FOREIGN KEY ("sentenceForbasicId") REFERENCES "SentenceForbasic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_sentenceForbasicId_fkey" FOREIGN KEY ("sentenceForbasicId") REFERENCES "SentenceForbasic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NativeAudioAttempt" ADD CONSTRAINT "NativeAudioAttempt_sentenceForbasicId_fkey" FOREIGN KEY ("sentenceForbasicId") REFERENCES "SentenceForbasic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recordings" ADD CONSTRAINT "Recordings_sentenceForbasicId_fkey" FOREIGN KEY ("sentenceForbasicId") REFERENCES "SentenceForbasic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YouTubeViewAttempt" ADD CONSTRAINT "YouTubeViewAttempt_sentenceForbasicId_fkey" FOREIGN KEY ("sentenceForbasicId") REFERENCES "SentenceForbasic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
