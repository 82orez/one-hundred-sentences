// src/app/api/user-course-points/points-detail/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateStudentDetailPoints } from "@/utils/countTotalEachPoints";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const studentId = searchParams.get("studentId");

    if (!courseId) {
      return NextResponse.json({ error: "강좌 ID가 필요합니다." }, { status: 400 });
    }

    if (!studentId) {
      return NextResponse.json({ error: "학생 ID가 필요합니다." }, { status: 400 });
    }

    // calculateStudentDetailPoints 함수를 사용하여 포인트 상세 정보 계산
    const pointsDetail = await calculateStudentDetailPoints(courseId, studentId);

    return NextResponse.json(pointsDetail);
  } catch (error) {
    console.error("포인트 상세 데이터 조회 중 오류 발생:", error);
    return NextResponse.json({ error: "포인트 상세 데이터를 가져오는 중 오류가 발생했습니다." }, { status: 500 });
  }
}
