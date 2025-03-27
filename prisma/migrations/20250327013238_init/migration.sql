/*
  Warnings:

  - You are about to drop the column `attmptCount` on the `Recordings` table. All the data in the column will be lost.
  - Added the required column `attemptCount` to the `Recordings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Recordings" DROP COLUMN "attmptCount",
ADD COLUMN     "attemptCount" INTEGER NOT NULL;
