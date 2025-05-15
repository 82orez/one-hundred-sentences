/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Selected` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Selected_userId_key" ON "Selected"("userId");
