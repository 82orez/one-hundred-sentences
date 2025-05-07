// /app/api/admin/check-teacher-conflicts/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 관리자 권한 확인
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });
    }
    const { classDates, startTime, endTime, currentCourseId } = await request.json();

    // 모든 활성 강사 가져오기
    const teachers = await prisma.teachers.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    const conflicts: Record<string, any[]> = {};

    // 각 강사별로 충돌 확인
    for (const teacher of teachers) {
      const teacherId = teacher.id;

      // 강사의 모든 강좌 가져오기 (현재 편집 중인 강좌 제외)
      const teacherCourses = await prisma.course.findMany({
        where: {
          teacherId,
          ...(currentCourseId ? { id: { not: currentCourseId } } : {}),
        },
        include: {
          classDates: true,
        },
      });

      // 충돌 확인
      const conflictingCourses = [];

      for (const course of teacherCourses) {
        for (const classDate of classDates) {
          // 강좌의 수업 일자와 비교
          const courseDate = course.classDates.find(
            (cd: any) => new Date(cd.date).toISOString().split("T")[0] === new Date(classDate.date).toISOString().split("T")[0],
          );

          if (courseDate) {
            // 시간 충돌 확인
            const courseStartTime = course.startTime || courseDate.startTime;
            const courseEndTime = course.endTime || courseDate.endTime;

            if (courseStartTime && courseEndTime) {
              // 시간 충돌 확인 로직
              const newStart = startTime;
              const newEnd = endTime;
              const existingStart = courseStartTime;
              const existingEnd = courseEndTime;

              // 시간 문자열을 분으로 변환하는 함수
              const timeToMinutes = (time: string) => {
                const [hours, minutes] = time.split(":").map(Number);
                return hours * 60 + minutes;
              };

              const newStartMinutes = timeToMinutes(newStart);
              const newEndMinutes = timeToMinutes(newEnd);
              const existingStartMinutes = timeToMinutes(existingStart);
              const existingEndMinutes = timeToMinutes(existingEnd);

              // 시간 충돌 조건: 새 시간이 기존 시간과 겹치는지 확인
              if (
                (newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes) ||
                (existingStartMinutes < newEndMinutes && existingEndMinutes > newStartMinutes)
              ) {
                conflictingCourses.push({
                  id: course.id,
                  title: course.title,
                  date: new Date(courseDate.date).toISOString().split("T")[0],
                  startTime: courseStartTime,
                  endTime: courseEndTime,
                });

                // 👇 충돌되는 모든 스케줄 기록
                continue; // break → continue
              }
            }
          }
        }
      }

      // 충돌이 있는 경우에만 기록
      if (conflictingCourses.length > 0) {
        conflicts[teacherId] = conflictingCourses;
      }
    }

    return NextResponse.json({ conflicts });
  } catch (error) {
    console.error("강사 스케줄 충돌 확인 오류:", error);
    return NextResponse.json({ error: "강사 스케줄 충돌 확인 중 오류가 발생했습니다." }, { status: 500 });
  }
}
