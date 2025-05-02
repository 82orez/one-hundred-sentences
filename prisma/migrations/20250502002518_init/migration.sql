/*
  Warnings:

  - Made the column `nickName` on table `Teachers` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Teachers" ALTER COLUMN "nickName" SET NOT NULL,
ALTER COLUMN "nickName" SET DEFAULT '없음';
