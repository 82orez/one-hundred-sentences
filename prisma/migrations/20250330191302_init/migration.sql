/*
  Warnings:

  - You are about to drop the `Test` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Test";

-- CreateTable
CREATE TABLE "unitSubject" (
    "id" TEXT NOT NULL,
    "unitNumber" INTEGER,
    "subjectKo" TEXT,
    "subjectEn" TEXT,

    CONSTRAINT "unitSubject_pkey" PRIMARY KEY ("id")
);
