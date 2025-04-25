import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const teacherId = searchParams.get("teacherId");

    if (!teacherId) {
      return NextResponse.json({ error: "강사 ID가 필요합니다." }, { status: 400 });
    }

    // 강사의 수업 일정 조회
    const courses = await prisma.course.findMany({
      where: {
        teacherId: teacherId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        startTime: true,
        endTime: true,
        duration: true,
        scheduleMonday: true,
        scheduleTuesday: true,
        scheduleWednesday: true,
        scheduleThursday: true,
        scheduleFriday: true,
        scheduleSaturday: true,
        scheduleSunday: true,
      },
      orderBy: {
        startDate: "asc",
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("강사 스케줄 조회 중 오류 발생:", error);
    return NextResponse.json({ error: "강사 스케줄을 불러오는 중 오류가 발생했습니다." }, { status: 500 });
  }
}
