// src/app/api/admin/check-teacher-schedule-conflict/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format, parseISO } from "date-fns";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 관리자 권한 확인
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });
    }

    // 요청 본문 파싱
    const { teacherId, courseId, date, startTime, endTime } = await request.json();

    // 필수 매개변수 확인
    if (!teacherId || !date || !startTime || !endTime) {
      return NextResponse.json({ error: "강사 ID, 날짜, 시작 시간, 종료 시간은 필수 항목입니다." }, { status: 400 });
    }

    // 주어진 날짜에 해당 강사의 모든 수업 찾기
    // 날짜 범위로 조회 (해당 날짜의 00:00:00부터 23:59:59까지)
    const dateStart = new Date(`${date}T00:00:00Z`); // UTC 기준 날짜 시작
    const dateEnd = new Date(`${date}T23:59:59Z`); // UTC 기준 날짜 끝

    const teacherClassesOnDate = await prisma.classDate.findMany({
      where: {
        date: {
          gte: dateStart,
          lte: dateEnd,
        },
        course: {
          teacherId: teacherId,
          // 현재 편집 중인 코스는 제외 (있는 경우)
          ...(courseId ? { id: { not: courseId } } : {}),
        },
      },
      include: {
        course: true,
      },
    });

    // 시간을 분 단위로 변환하는 함수
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    // 새로운 수업 시간
    const newStartMinutes = timeToMinutes(startTime);
    const newEndMinutes = timeToMinutes(endTime);

    // 충돌 검사
    let hasConflict = false;
    let conflictDetails = null;

    for (const classDate of teacherClassesOnDate) {
      // 이미 있는 수업의 시작/종료 시간
      const existingStartTime = classDate.startTime || classDate.course.startTime;
      const existingEndTime = classDate.endTime || classDate.course.endTime;

      if (existingStartTime && existingEndTime) {
        const existingStartMinutes = timeToMinutes(existingStartTime);
        const existingEndMinutes = timeToMinutes(existingEndTime);

        // 충돌 조건:
        // 1. 새 수업 시작이 기존 수업 중간에 있는 경우
        // 2. 새 수업 종료가 기존 수업 중간에 있는 경우
        // 3. 새 수업이 기존 수업을 완전히 포함하는 경우
        // 4. 기존 수업이 새 수업을 완전히 포함하는 경우
        if (
          (newStartMinutes >= existingStartMinutes && newStartMinutes < existingEndMinutes) ||
          (newEndMinutes > existingStartMinutes && newEndMinutes <= existingEndMinutes) ||
          (newStartMinutes <= existingStartMinutes && newEndMinutes >= existingEndMinutes) ||
          (newStartMinutes >= existingStartMinutes && newEndMinutes <= existingEndMinutes)
        ) {
          hasConflict = true;
          conflictDetails = {
            courseTitle: classDate.course.title,
            date: format(classDate.date, "yyyy년 MM월 dd일"),
            time: `${existingStartTime} - ${existingEndTime}`,
          };
          break;
        }
      }
    }

    return NextResponse.json({
      hasConflict,
      conflictDetails,
    });
  } catch (error) {
    console.error("강사 스케줄 충돌 확인 오류:", error);
    return NextResponse.json({ error: "스케줄 충돌 확인 중 오류가 발생했습니다." }, { status: 500 });
  }
}
