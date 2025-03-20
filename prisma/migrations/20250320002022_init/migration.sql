-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isTeacher" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ClassSession" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "meetingNumber" TEXT NOT NULL,
    "password" TEXT,
    "teacherId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_StudentClasses" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_StudentClasses_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_StudentClasses_B_index" ON "_StudentClasses"("B");

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentClasses" ADD CONSTRAINT "_StudentClasses_A_fkey" FOREIGN KEY ("A") REFERENCES "ClassSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentClasses" ADD CONSTRAINT "_StudentClasses_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
