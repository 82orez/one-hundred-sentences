-- CreateTable
CREATE TABLE "Teachers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "realName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Teachers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Teachers_userId_key" ON "Teachers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Teachers_email_key" ON "Teachers"("email");

-- AddForeignKey
ALTER TABLE "Teachers" ADD CONSTRAINT "Teachers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
