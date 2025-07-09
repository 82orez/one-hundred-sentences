-- CreateEnum
CREATE TYPE "WaitForPurchaseStatus" AS ENUM ('pending', 'paid', 'cancelled', 'expired');

-- CreateTable
CREATE TABLE "WaitForPurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "courseTitle" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userPhone" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "classCount" INTEGER NOT NULL,
    "totalFee" INTEGER NOT NULL,
    "status" "WaitForPurchaseStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "WaitForPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WaitForPurchase_userId_idx" ON "WaitForPurchase"("userId");

-- CreateIndex
CREATE INDEX "WaitForPurchase_courseId_idx" ON "WaitForPurchase"("courseId");

-- CreateIndex
CREATE INDEX "WaitForPurchase_status_idx" ON "WaitForPurchase"("status");

-- CreateIndex
CREATE UNIQUE INDEX "WaitForPurchase_userId_courseId_key" ON "WaitForPurchase"("userId", "courseId");

-- AddForeignKey
ALTER TABLE "WaitForPurchase" ADD CONSTRAINT "WaitForPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaitForPurchase" ADD CONSTRAINT "WaitForPurchase_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
