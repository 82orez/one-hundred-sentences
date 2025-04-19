// app/api/teachers/applications/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // 관리자 권한 확인
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
    }

    // 강사 신청한 사용자 목록 조회
    const teacherApplications = await prisma.user.findMany({
      where: {
        isApplyForTeacher: true
      },
      select: {
        id: true,
        realName: true,
        email: true,
        phone: true,
        image: true,
        createdAt: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(teacherApplications);
  } catch (error) {
    console.error("강사 신청 목록 조회 중 오류 발생:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}