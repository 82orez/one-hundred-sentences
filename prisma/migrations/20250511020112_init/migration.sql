/*
  Warnings:

  - Added the required column `contents` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Contents" AS ENUM ('tour100', 'basic100', 'wh100');

-- CreateEnum
CREATE TYPE "Location" AS ENUM ('online', 'offline', 'hybrid');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "contents" "Contents" NOT NULL,
ADD COLUMN     "location" "Location" NOT NULL;
