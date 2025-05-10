/*
  Warnings:

  - You are about to drop the column `email` on the `Teachers` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Teachers` table. All the data in the column will be lost.
  - You are about to drop the column `realName` on the `Teachers` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Teachers_email_key";

-- AlterTable
ALTER TABLE "Teachers" DROP COLUMN "email",
DROP COLUMN "phone",
DROP COLUMN "realName";
