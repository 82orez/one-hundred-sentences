-- CreateTable
CREATE TABLE "VoiceListened" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "myVoiceOpenListId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoiceListened_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VoiceListened_userId_myVoiceOpenListId_key" ON "VoiceListened"("userId", "myVoiceOpenListId");

-- AddForeignKey
ALTER TABLE "VoiceListened" ADD CONSTRAINT "VoiceListened_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceListened" ADD CONSTRAINT "VoiceListened_myVoiceOpenListId_fkey" FOREIGN KEY ("myVoiceOpenListId") REFERENCES "MyVoiceOpenList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
