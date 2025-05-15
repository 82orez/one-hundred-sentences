/*
  Warnings:

  - Made the column `contents` on table `unitSubject` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "unitSubject" ALTER COLUMN "contents" SET NOT NULL;
