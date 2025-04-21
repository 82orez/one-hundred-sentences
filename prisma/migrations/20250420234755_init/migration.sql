-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "scheduleFriday" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scheduleMonday" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scheduleSaturday" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scheduleSunday" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scheduleThursday" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scheduleTuesday" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scheduleWednesday" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "teacherId" TEXT;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
