import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Teachers 모델에 필요한 추가 프로퍼티를 포함하는 인터페이스 정의
interface TeacherWithSchedule {
  id: string;
  email: string;
  realName: string;
  phone: string;
  nation: any; // Nation enum
  subject: any; // Subject enum
  nickName: string;
  isActive: boolean;
  isAvailable?: boolean;
  conflictingCourses?: any[];
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const url = new URL(request.url);
    const classDatesJson = url.searchParams.get("classDates");
    const currentTeacherId = url.searchParams.get("currentTeacherId");

    if (!session || !session.user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    // 기본 강사 쿼리
    const teachersQuery = {
      where: {
        isActive: true,
      },
      select: {
        id: true,
        realName: true,
        email: true,
        phone: true,
        nation: true,
        subject: true,
        nickName: true,
        isActive: true,
      },
    };

    // 모든 활성화된 강사 가져오기
    const teachers = await prisma.teachers.findMany(teachersQuery);

    // 수업 일정 파라미터가 있으면 스케줄 충돌 검사
    if (classDatesJson) {
      const classDates = JSON.parse(classDatesJson);

      // 각 강사별 충돌 정보를 담을 배열
      const teachersWithScheduleInfo: TeacherWithSchedule[] = [];

      for (const teacher of teachers) {
        const teacherWithSchedule = teacher as TeacherWithSchedule;

        // 현재 편집 중인 강좌의 강사인 경우 제외하지 않음
        if (currentTeacherId && teacher.id === currentTeacherId) {
          teacherWithSchedule.isAvailable = true;
          teacherWithSchedule.conflictingCourses = [];
          teachersWithScheduleInfo.push(teacherWithSchedule);
          continue;
        }

        // 강사의 모든 강좌 검색
        const teacherCourses = await prisma.course.findMany({
          where: {
            teacherId: teacher.id,
          },
          include: {
            classDates: true,
          },
        });

        // 충돌 확인
        const conflicts = [];

        for (const course of teacherCourses) {
          for (const classDate of classDates) {
            // 날짜 변환
            const newClassDate = new Date(classDate.date);
            const newStartTime = classDate.startTime;
            const newEndTime = classDate.endTime;

            // 이 강좌의 날짜와 시간 중에 겹치는 것이 있는지 확인
            const conflictingDates = course.classDates.filter((cd) => {
              const existingDate = new Date(cd.date);

              // 날짜가 같은지 확인
              if (existingDate.toDateString() !== newClassDate.toDateString()) {
                return false;
              }

              // 시간이 겹치는지 확인
              if (!cd.startTime || !cd.endTime || !newStartTime || !newEndTime) {
                return false;
              }

              // 시작 시간과 종료 시간을 분으로 변환하여 비교
              const [existingStartHour, existingStartMinute] = cd.startTime.split(":").map(Number);
              const [existingEndHour, existingEndMinute] = cd.endTime.split(":").map(Number);
              const [newStartHour, newStartMinute] = newStartTime.split(":").map(Number);
              const [newEndHour, newEndMinute] = newEndTime.split(":").map(Number);

              const existingStartMinutes = existingStartHour * 60 + existingStartMinute;
              const existingEndMinutes = existingEndHour * 60 + existingEndMinute;
              const newStartMinutes = newStartHour * 60 + newStartMinute;
              const newEndMinutes = newEndHour * 60 + newEndMinute;

              // 시간 겹침 확인 (새 수업이 기존 수업 시간 내에 시작하거나 끝나는 경우)
              return (
                (newStartMinutes >= existingStartMinutes && newStartMinutes < existingEndMinutes) ||
                (newEndMinutes > existingStartMinutes && newEndMinutes <= existingEndMinutes) ||
                (newStartMinutes <= existingStartMinutes && newEndMinutes >= existingEndMinutes)
              );
            });

            if (conflictingDates.length > 0) {
              // 충돌하는 강좌 정보 추가
              for (const course of teacherCourses) {
                let courseConflict = conflicts.find((c) => c.courseId === course.id);

                for (const classDate of classDates) {
                  const newClassDate = new Date(classDate.date);
                  const newStartTime = classDate.startTime;
                  const newEndTime = classDate.endTime;

                  const conflictingDates = course.classDates.filter((cd) => {
                    const existingDate = new Date(cd.date);
                    if (existingDate.toDateString() !== newClassDate.toDateString()) return false;
                    if (!cd.startTime || !cd.endTime || !newStartTime || !newEndTime) return false;

                    const [existingStartHour, existingStartMinute] = cd.startTime.split(":").map(Number);
                    const [existingEndHour, existingEndMinute] = cd.endTime.split(":").map(Number);
                    const [newStartHour, newStartMinute] = newStartTime.split(":").map(Number);
                    const [newEndHour, newEndMinute] = newEndTime.split(":").map(Number);

                    const existingStartMinutes = existingStartHour * 60 + existingStartMinute;
                    const existingEndMinutes = existingEndHour * 60 + existingEndMinute;
                    const newStartMinutes = newStartHour * 60 + newStartMinute;
                    const newEndMinutes = newEndHour * 60 + newEndMinute;

                    return (
                      (newStartMinutes >= existingStartMinutes && newStartMinutes < existingEndMinutes) ||
                      (newEndMinutes > existingStartMinutes && newEndMinutes <= existingEndMinutes) ||
                      (newStartMinutes <= existingStartMinutes && newEndMinutes >= existingEndMinutes)
                    );
                  });

                  if (conflictingDates.length > 0) {
                    if (!courseConflict) {
                      courseConflict = {
                        courseId: course.id,
                        courseTitle: course.title,
                        conflictingDates: [],
                      };
                      conflicts.push(courseConflict);
                    }

                    for (const cd of conflictingDates) {
                      // 중복 날짜 방지
                      if (!courseConflict.conflictingDates.find((d) => d.date === cd.date)) {
                        courseConflict.conflictingDates.push({
                          date: cd.date,
                          startTime: cd.startTime,
                          endTime: cd.endTime,
                        });
                      }
                    }
                  }
                }
              }
            }
          }
        }

        // 충돌 정보 추가
        teacherWithSchedule.isAvailable = conflicts.length === 0;
        teacherWithSchedule.conflictingCourses = conflicts;
        teachersWithScheduleInfo.push(teacherWithSchedule);
      }

      return NextResponse.json({ teachers: teachersWithScheduleInfo });
    }

    return NextResponse.json({ teachers });
  } catch (error) {
    console.error("강사 목록 조회 오류:", error);
    return NextResponse.json({ error: "강사 목록을 불러오는데 실패했습니다." }, { status: 500 });
  }
}
