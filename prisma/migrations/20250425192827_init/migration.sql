-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "classCount" INTEGER DEFAULT 1,
ADD COLUMN     "classDates" TEXT,
ALTER COLUMN "duration" DROP DEFAULT;
