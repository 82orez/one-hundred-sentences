/*
  Warnings:

  - Made the column `selectedCourseId` on table `Selected` required. This step will fail if there are existing NULL values in that column.
  - Made the column `selectedCourseContents` on table `Selected` required. This step will fail if there are existing NULL values in that column.
  - Made the column `selectedCourseTitle` on table `Selected` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Selected" ALTER COLUMN "selectedCourseId" SET NOT NULL,
ALTER COLUMN "selectedCourseContents" SET NOT NULL,
ALTER COLUMN "selectedCourseTitle" SET NOT NULL;
