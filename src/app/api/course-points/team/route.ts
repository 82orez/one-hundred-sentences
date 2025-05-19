// src/app/api/course-points/team/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// 특정 코스의 모든 학생 포인트 합계 조회
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const url = new URL(req.url);
  const courseId = url.searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json({ error: "courseId가 필요합니다" }, { status: 400 });
  }

  try {
    // 해당 코스의 모든 사용자 포인트 데이터 조회
    const allCoursePoints = await prisma.userCoursePoints.findMany({
      where: {
        courseId: courseId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            realName: true,
          },
        },
      },
      orderBy: {
        points: "desc",
      },
    });

    // 총 포인트 계산
    const totalPoints = allCoursePoints.reduce((sum, record) => sum + record.points, 0);

    return NextResponse.json({
      totalPoints,
      students: allCoursePoints,
    });
  } catch (error) {
    console.error("팀 포인트 조회 중 오류 발생:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
