/*
  Warnings:

  - You are about to drop the column `isMakeup` on the `ClassDate` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `ClassDate` table. All the data in the column will be lost.
  - You are about to drop the column `originalDateId` on the `ClassDate` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `ClassDate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ClassDate" DROP COLUMN "isMakeup",
DROP COLUMN "note",
DROP COLUMN "originalDateId",
DROP COLUMN "status";

-- DropEnum
DROP TYPE "ClassDateStatus";
