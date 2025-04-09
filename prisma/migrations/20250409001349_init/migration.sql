/*
  Warnings:

  - You are about to drop the column `completedAt` on the `favoriteSentence` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "favoriteSentence" DROP COLUMN "completedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
