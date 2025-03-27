-- CreateTable
CREATE TABLE "UserNextDay" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userNextDay" INTEGER NOT NULL,
    "totalCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserNextDay_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserNextDay" ADD CONSTRAINT "UserNextDay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
