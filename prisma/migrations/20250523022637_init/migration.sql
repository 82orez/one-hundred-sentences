/*
  Warnings:

  - You are about to drop the `unitSubject` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "unitSubject";

-- CreateTable
CREATE TABLE "UnitSubject" (
    "id" TEXT NOT NULL,
    "contents" "Contents" NOT NULL,
    "unitNumber" INTEGER NOT NULL,
    "subjectKo" TEXT NOT NULL,
    "subjectEn" TEXT,
    "unitUtubeUrl" TEXT,

    CONSTRAINT "UnitSubject_pkey" PRIMARY KEY ("id")
);
