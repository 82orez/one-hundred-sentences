/*
  Warnings:

  - You are about to drop the column `userEmail` on the `Recordings` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Recordings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Recordings" DROP COLUMN "userEmail",
ADD COLUMN     "atemptCount" SERIAL NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
