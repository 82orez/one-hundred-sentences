-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "courseId" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "realName" TEXT;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
