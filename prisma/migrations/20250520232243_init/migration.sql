-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_classDateId_fkey" FOREIGN KEY ("classDateId") REFERENCES "ClassDate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
