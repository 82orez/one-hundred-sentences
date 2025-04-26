/*
  Warnings:

  - You are about to drop the column `endTime` on the `ClassDate` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `ClassDate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ClassDate" DROP COLUMN "endTime",
DROP COLUMN "startTime";
