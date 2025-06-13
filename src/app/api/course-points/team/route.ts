// src/app/api/course-points/team/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { calculateTotalTeamPoints } from "@/utils/countTotalTeamPoints";

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
    const result = await calculateTotalTeamPoints(courseId);

    return NextResponse.json({
      totalPoints: result.totalTeamPoints,
      studentCount: result.studentCount,
    });
  } catch (error) {
    console.error("팀 포인트 조회 중 오류 발생:", error);
    return NextResponse.json({ message: "팀 포인트 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
