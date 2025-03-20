-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'semiAdmin', 'teacher', 'student');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'student';
