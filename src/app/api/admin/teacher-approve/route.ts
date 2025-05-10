// app/api/teachers/approve/route.ts
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

    // 해당 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });
    }

    if (!user.isApplyForTeacher) {
      return NextResponse.json({ error: "강사 신청을 하지 않은 사용자입니다" }, { status: 400 });
    }

    // 트랜잭션으로 여러 작업 수행
    const result = await prisma.$transaction(async (tx) => {
      // 1. 사용자 역할을 teacher로 변경하고 신청 상태 취소
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          role: "teacher",
          isApplyForTeacher: false,
        },
      });

      // 2. Teachers 테이블에 데이터 생성 (isActive는 기본값 false)
      const newTeacher = await tx.teachers.create({
        data: {
          userId: userId,
        },
      });

      return { updatedUser, newTeacher };
    });

    return NextResponse.json({
      message: "강사 승인이 완료되었습니다",
      data: result,
    });
  } catch (error) {
    console.error("강사 승인 처리 중 오류 발생:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
