// src/app/api/course-points/rank/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // 세션에서 사용자 정보 가져오기
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 요청 URL 에서 courseId 파라미터 추출
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    // 해당 코스의 모든 학생 포인트 조회
    const allCoursePoints = await prisma.userCoursePoints.findMany({
      where: { courseId },
      orderBy: { points: "desc" },
    });

    // 총 학생 수
    const totalStudents = allCoursePoints.length;

    // 현재 사용자의 순위 찾기
    const userRank = allCoursePoints.findIndex((point) => point.userId === session.user.id) + 1;

    return NextResponse.json({
      rank: userRank,
      totalStudents,
    });
  } catch (error) {
    console.error("Error fetching rank data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
