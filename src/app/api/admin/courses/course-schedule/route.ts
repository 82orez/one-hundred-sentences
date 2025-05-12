import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 로그인 확인
    if (!session || !session.user) {
      return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
    }
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ error: "수업 ID가 필요합니다." }, { status: 400 });
    }

    // 특정 수업의 일정 조회 (ClassDate 모델 사용)
    const classDates = await prisma.classDate.findMany({
      where: {
        courseId: courseId,
      },
      select: {
        id: true,
        date: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        course: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(classDates);
  } catch (error) {
    console.error("수업 일정 조회 중 오류 발생:", error);
    return NextResponse.json({ error: "수업 일정을 불러오는 중 오류가 발생했습니다." }, { status: 500 });
  }
}
