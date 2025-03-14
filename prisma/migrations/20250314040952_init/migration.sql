/*
  Warnings:

  - You are about to drop the column `orderName` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `payMethod` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `planId` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the `Plan` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_planId_fkey";

-- DropIndex
DROP INDEX "Purchase_planId_idx";

-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "orderName",
DROP COLUMN "payMethod",
DROP COLUMN "planId",
DROP COLUMN "status";

-- DropTable
DROP TABLE "Plan";

-- DropEnum
DROP TYPE "PurchaseStatus";
