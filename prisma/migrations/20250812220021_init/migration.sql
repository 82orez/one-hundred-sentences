-- AlterTable
ALTER TABLE "PerthQuestion" ADD COLUMN     "consultationContent" TEXT,
ADD COLUMN     "consultedAt" TIMESTAMP(3),
ADD COLUMN     "consultedBy" TEXT;
