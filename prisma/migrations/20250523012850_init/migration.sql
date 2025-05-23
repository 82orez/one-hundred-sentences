-- AddForeignKey
ALTER TABLE "UserNextDay" ADD CONSTRAINT "UserNextDay_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
