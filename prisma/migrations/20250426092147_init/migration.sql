-- CreateEnum
CREATE TYPE "ClassDateStatus" AS ENUM ('scheduled', 'completed', 'canceled', 'holiday');

-- AlterTable
ALTER TABLE "ClassDate" ADD COLUMN     "isMakeup" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "originalDateId" TEXT,
ADD COLUMN     "status" "ClassDateStatus" NOT NULL DEFAULT 'scheduled';
