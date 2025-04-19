// app/api/admin/delete-teacher/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 관리자 권한 확인
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "사용자 ID가 필요합니다" }, { status: 400 });
    }

    // 트랜잭션으로 여러 작업 수행
    const result = await prisma.$transaction(async (tx) => {
      // 1. Teachers 테이블에서 해당 강사 삭제
      await tx.teachers.delete({
        where: { userId: userId }
      });

      // 2. 사용자 역할을 student로 변경
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          role: "student"
        }
      });

      return { updatedUser };
    });

    return NextResponse.json({
      message: "강사가 성공적으로 삭제되었습니다",
      data: result
    });
  } catch (error) {
    console.error("강사 삭제 중 오류 발생:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}