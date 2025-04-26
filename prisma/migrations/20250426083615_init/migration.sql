-- AlterTable
ALTER TABLE "ClassDate" ADD COLUMN     "reason" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'normal';
