-- AlterEnum
ALTER TYPE "Location" ADD VALUE 'onlyApp';

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 0;
