// src/app/api/admin/teacher-attendance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const teacherId = searchParams.get("teacherId");
  const courseId = searchParams.get("courseId");

  if (!teacherId || !courseId) {
    return NextResponse.json({ error: "강사 ID와 강좌 ID가 필요합니다" }, { status: 400 });
  }

  try {
    // 1. 해당 코스의 수업 일정 가져오기
    const classDates = await prisma.classDate.findMany({
      where: {
        courseId: courseId,
      },
      orderBy: {
        date: "asc",
      },
    });

    // 2. 해당 강사의 수업 출석 정보 가져오기
    const attendanceData = await prisma.teacherAttendance.findMany({
      where: {
        teacherId: teacherId,
        courseId: courseId,
      },
    });

    // 디버깅을 위한 로그 추가
    console.log("조회 파라미터:", { teacherId, courseId });
    console.log("조회된 출석 데이터:", attendanceData);

    return NextResponse.json({
      classDates,
      attendanceData,
    });
  } catch (error) {
    console.error("강사 출석 정보 조회 오류:", error);
    return NextResponse.json({ error: "강사 출석 정보를 가져오는데 문제가 발생했습니다" }, { status: 500 });
  }
}