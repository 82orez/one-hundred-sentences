/*
  Warnings:

  - Added the required column `userId` to the `Selected` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Selected" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Selected" ADD CONSTRAINT "Selected_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
