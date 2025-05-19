// src/app/api/admin/enrollments/count/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ error: "강좌 ID가 필요합니다." }, { status: 400 });
    }

    // 해당 강좌의 활성화된 수강생 수 계산
    const studentsCount = await prisma.enrollment.count({
      where: {
        courseId,
        status: "active", // 현재 활성화된 수강생만 계산
      },
    });

    return NextResponse.json({ count: studentsCount });
  } catch (error) {
    console.error("수강생 수 조회 오류:", error);
    return NextResponse.json({ error: "수강생 수 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
