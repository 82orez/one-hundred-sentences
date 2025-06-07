-- CreateTable
CREATE TABLE "MyVoiceOpenList" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sentenceNo" INTEGER NOT NULL,
    "sentenceEn" TEXT NOT NULL,
    "myVoiceUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MyVoiceOpenList_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MyVoiceOpenList" ADD CONSTRAINT "MyVoiceOpenList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MyVoiceOpenList" ADD CONSTRAINT "MyVoiceOpenList_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MyVoiceOpenList" ADD CONSTRAINT "MyVoiceOpenList_sentenceNo_fkey" FOREIGN KEY ("sentenceNo") REFERENCES "Sentence"("no") ON DELETE CASCADE ON UPDATE CASCADE;
