/*
  Warnings:

  - You are about to drop the column `reason` on the `ClassDate` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `ClassDate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ClassDate" DROP COLUMN "reason",
DROP COLUMN "status";
