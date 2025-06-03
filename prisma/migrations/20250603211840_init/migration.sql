-- CreateTable
CREATE TABLE "Configuration" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuration_pkey" PRIMARY KEY ("id")
);
