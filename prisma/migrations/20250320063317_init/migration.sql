/*
  Warnings:

  - You are about to drop the column `isTeacher` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `ClassSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_StudentClasses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ClassSession" DROP CONSTRAINT "ClassSession_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "_StudentClasses" DROP CONSTRAINT "_StudentClasses_A_fkey";

-- DropForeignKey
ALTER TABLE "_StudentClasses" DROP CONSTRAINT "_StudentClasses_B_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isTeacher";

-- DropTable
DROP TABLE "ClassSession";

-- DropTable
DROP TABLE "_StudentClasses";
