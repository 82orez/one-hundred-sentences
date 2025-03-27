/*
  Warnings:

  - You are about to drop the column `atemptCount` on the `Recordings` table. All the data in the column will be lost.
  - Added the required column `attmptCount` to the `Recordings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Recordings" DROP COLUMN "atemptCount",
ADD COLUMN     "attmptCount" INTEGER NOT NULL;
