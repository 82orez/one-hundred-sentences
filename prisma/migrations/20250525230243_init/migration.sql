/*
  Warnings:

  - You are about to drop the column `isImageOpen` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isImageOpen",
ADD COLUMN     "isImagePublicOpen" BOOLEAN NOT NULL DEFAULT false;
