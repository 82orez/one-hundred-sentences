// src/app/api/teacher/courses/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 강좌 목록 조회 API
export async function GET() {
  try {
    // 현재 로그인한 사용자 세션 확인
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    // 현재 사용자가 강사인지 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!(user?.role === "teacher" || user?.role === "admin")) {
      return NextResponse.json({ error: "강사 권한이 없습니다." }, { status: 403 });
    }

    // 강사의 강좌 목록 조회
    const courses = await prisma.course.findMany({
      where: {
        generatorId: session.user.id,
      },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("강좌 목록 조회 오류:", error);
    return NextResponse.json({ error: "강좌 목록을 조회하는 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// 새 강좌 생성 API
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const data = await request.json();

    const course = await prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        generatorId: session.user.id,
        teacherId: data.teacherId,
        scheduleMonday: data.scheduleMonday,
        scheduleTuesday: data.scheduleTuesday,
        scheduleWednesday: data.scheduleWednesday,
        scheduleThursday: data.scheduleThursday,
        scheduleFriday: data.scheduleFriday,
        scheduleSaturday: data.scheduleSaturday,
        scheduleSunday: data.scheduleSunday,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        startTime: data.startTime || null, // 시작 시간 추가
      },
    });

    return NextResponse.json({ course });
  } catch (error) {
    console.error("강좌 생성 오류:", error);
    return NextResponse.json({ error: "강좌 생성에 실패했습니다." }, { status: 500 });
  }
}
