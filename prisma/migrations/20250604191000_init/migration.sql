-- CreateTable
CREATE TABLE "TeacherAttendance" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "classDateId" TEXT NOT NULL,
    "isAttended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeacherAttendance_teacherId_courseId_classDateId_key" ON "TeacherAttendance"("teacherId", "courseId", "classDateId");

-- AddForeignKey
ALTER TABLE "TeacherAttendance" ADD CONSTRAINT "TeacherAttendance_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAttendance" ADD CONSTRAINT "TeacherAttendance_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAttendance" ADD CONSTRAINT "TeacherAttendance_classDateId_fkey" FOREIGN KEY ("classDateId") REFERENCES "ClassDate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
