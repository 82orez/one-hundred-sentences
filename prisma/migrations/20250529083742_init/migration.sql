-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_generatorId_fkey";

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "generatorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_generatorId_fkey" FOREIGN KEY ("generatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
