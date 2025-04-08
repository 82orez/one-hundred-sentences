/*
  Warnings:

  - You are about to drop the column `attempt` on the `QuizAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `correct` on the `QuizAttempt` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "QuizAttempt" DROP COLUMN "attempt",
DROP COLUMN "correct",
ADD COLUMN     "attemptQuiz" INTEGER,
ADD COLUMN     "correctCount" INTEGER,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "NativeAudioAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sentenceNo" INTEGER NOT NULL,
    "attemptNativeAudio" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NativeAudioAttempt_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NativeAudioAttempt" ADD CONSTRAINT "NativeAudioAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NativeAudioAttempt" ADD CONSTRAINT "NativeAudioAttempt_sentenceNo_fkey" FOREIGN KEY ("sentenceNo") REFERENCES "Sentence"("no") ON DELETE CASCADE ON UPDATE CASCADE;
