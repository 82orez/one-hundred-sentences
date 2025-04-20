/*
  Warnings:

  - You are about to drop the column `status` on the `Teachers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Teachers" DROP COLUMN "status",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false;
