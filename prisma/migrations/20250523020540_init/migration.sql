/*
  Warnings:

  - You are about to drop the `favoriteSentence` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "favoriteSentence" DROP CONSTRAINT "favoriteSentence_courseId_fkey";

-- DropForeignKey
ALTER TABLE "favoriteSentence" DROP CONSTRAINT "favoriteSentence_sentenceNo_fkey";

-- DropForeignKey
ALTER TABLE "favoriteSentence" DROP CONSTRAINT "favoriteSentence_userId_fkey";

-- DropTable
DROP TABLE "favoriteSentence";

-- CreateTable
CREATE TABLE "FavoriteSentence" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sentenceNo" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteSentence_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FavoriteSentence" ADD CONSTRAINT "FavoriteSentence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteSentence" ADD CONSTRAINT "FavoriteSentence_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteSentence" ADD CONSTRAINT "FavoriteSentence_sentenceNo_fkey" FOREIGN KEY ("sentenceNo") REFERENCES "Sentence"("no") ON DELETE CASCADE ON UPDATE CASCADE;
