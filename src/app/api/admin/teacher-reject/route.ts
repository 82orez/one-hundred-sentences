// app/api/teachers/reject/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 관리자 권한 확인
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
    }

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "사용자 ID가 필요합니다" }, { status: 400 });
    }

    // 신청 상태만 취소
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isApplyForTeacher: false
      }
    });

    return NextResponse.json({
      message: "강사 신청이 거절되었습니다",
      data: updatedUser
    });
  } catch (error) {
    console.error("강사 거절 처리 중 오류 발생:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}