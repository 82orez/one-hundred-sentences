/*
  Warnings:

  - Added the required column `updatedAt` to the `MyVoiceOpenList` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MyVoiceOpenList" DROP CONSTRAINT "MyVoiceOpenList_courseId_fkey";

-- DropForeignKey
ALTER TABLE "MyVoiceOpenList" DROP CONSTRAINT "MyVoiceOpenList_sentenceNo_fkey";

-- DropForeignKey
ALTER TABLE "MyVoiceOpenList" DROP CONSTRAINT "MyVoiceOpenList_userId_fkey";

-- AlterTable
ALTER TABLE "MyVoiceOpenList" ADD COLUMN     "likeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sentenceId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "VoiceLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "myVoiceOpenListId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoiceLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VoiceLike_userId_myVoiceOpenListId_key" ON "VoiceLike"("userId", "myVoiceOpenListId");

-- AddForeignKey
ALTER TABLE "MyVoiceOpenList" ADD CONSTRAINT "MyVoiceOpenList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MyVoiceOpenList" ADD CONSTRAINT "MyVoiceOpenList_sentenceId_fkey" FOREIGN KEY ("sentenceId") REFERENCES "Sentence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MyVoiceOpenList" ADD CONSTRAINT "MyVoiceOpenList_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceLike" ADD CONSTRAINT "VoiceLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceLike" ADD CONSTRAINT "VoiceLike_myVoiceOpenListId_fkey" FOREIGN KEY ("myVoiceOpenListId") REFERENCES "MyVoiceOpenList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
