-- CreateTable
CREATE TABLE "YouTubeViewAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sentenceNo" INTEGER NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "YouTubeViewAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "YouTubeViewAttempt_userId_sentenceNo_idx" ON "YouTubeViewAttempt"("userId", "sentenceNo");

-- AddForeignKey
ALTER TABLE "YouTubeViewAttempt" ADD CONSTRAINT "YouTubeViewAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YouTubeViewAttempt" ADD CONSTRAINT "YouTubeViewAttempt_sentenceNo_fkey" FOREIGN KEY ("sentenceNo") REFERENCES "Sentence"("no") ON DELETE CASCADE ON UPDATE CASCADE;
