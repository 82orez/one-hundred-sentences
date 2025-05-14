/*
  Warnings:

  - You are about to drop the column `sentenceForBasicNo` on the `CompletedSentence` table. All the data in the column will be lost.
  - You are about to drop the column `sentenceForbasicId` on the `NativeAudioAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `sentenceForbasicId` on the `QuizAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `sentenceForbasicId` on the `Recordings` table. All the data in the column will be lost.
  - You are about to drop the column `sentenceForbasicId` on the `YouTubeViewAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `sentenceForbasicId` on the `favoriteSentence` table. All the data in the column will be lost.
  - You are about to drop the `SentenceForbasic` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `sentenceNo` on table `CompletedSentence` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "CompletedSentence" DROP CONSTRAINT "CompletedSentence_sentenceForBasicNo_fkey";

-- DropForeignKey
ALTER TABLE "NativeAudioAttempt" DROP CONSTRAINT "NativeAudioAttempt_sentenceForbasicId_fkey";

-- DropForeignKey
ALTER TABLE "QuizAttempt" DROP CONSTRAINT "QuizAttempt_sentenceForbasicId_fkey";

-- DropForeignKey
ALTER TABLE "Recordings" DROP CONSTRAINT "Recordings_sentenceForbasicId_fkey";

-- DropForeignKey
ALTER TABLE "YouTubeViewAttempt" DROP CONSTRAINT "YouTubeViewAttempt_sentenceForbasicId_fkey";

-- DropForeignKey
ALTER TABLE "favoriteSentence" DROP CONSTRAINT "favoriteSentence_sentenceForbasicId_fkey";

-- DropIndex
DROP INDEX "CompletedSentence_userId_sentenceForBasicNo_key";

-- AlterTable
ALTER TABLE "CompletedSentence" DROP COLUMN "sentenceForBasicNo",
ALTER COLUMN "sentenceNo" SET NOT NULL;

-- AlterTable
ALTER TABLE "NativeAudioAttempt" DROP COLUMN "sentenceForbasicId";

-- AlterTable
ALTER TABLE "QuizAttempt" DROP COLUMN "sentenceForbasicId";

-- AlterTable
ALTER TABLE "Recordings" DROP COLUMN "sentenceForbasicId";

-- AlterTable
ALTER TABLE "YouTubeViewAttempt" DROP COLUMN "sentenceForbasicId";

-- AlterTable
ALTER TABLE "favoriteSentence" DROP COLUMN "sentenceForbasicId";

-- DropTable
DROP TABLE "SentenceForbasic";
