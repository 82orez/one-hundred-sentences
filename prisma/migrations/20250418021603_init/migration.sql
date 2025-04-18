/*
  Warnings:

  - You are about to drop the column `isApplyforTeacher` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isApplyforTeacher",
ADD COLUMN     "isApplyForTeacher" BOOLEAN NOT NULL DEFAULT false;
