/*
  Warnings:

  - Made the column `phone` on table `Teachers` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Nation" AS ENUM ('KR', 'PH');

-- CreateEnum
CREATE TYPE "Subject" AS ENUM ('en', 'ja', 'ko', 'zh');

-- AlterTable
ALTER TABLE "Teachers" ADD COLUMN     "nation" "Nation" NOT NULL DEFAULT 'KR',
ADD COLUMN     "subject" "Subject" NOT NULL DEFAULT 'en',
ALTER COLUMN "phone" SET NOT NULL;
