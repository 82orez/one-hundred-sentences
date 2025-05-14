/*
  Warnings:

  - Made the column `contents` on table `Sentence` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Sentence" ALTER COLUMN "contents" SET NOT NULL;
