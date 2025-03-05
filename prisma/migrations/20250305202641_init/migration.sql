-- CreateTable
CREATE TABLE "Recordings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT,
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recordings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Recordings" ADD CONSTRAINT "Recordings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
