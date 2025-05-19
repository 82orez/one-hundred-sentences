-- CreateTable
CREATE TABLE "UserCoursePoints" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCoursePoints_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserCoursePoints_userId_idx" ON "UserCoursePoints"("userId");

-- CreateIndex
CREATE INDEX "UserCoursePoints_courseId_idx" ON "UserCoursePoints"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCoursePoints_userId_courseId_key" ON "UserCoursePoints"("userId", "courseId");

-- AddForeignKey
ALTER TABLE "UserCoursePoints" ADD CONSTRAINT "UserCoursePoints_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCoursePoints" ADD CONSTRAINT "UserCoursePoints_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
