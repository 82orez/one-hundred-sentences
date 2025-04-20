// /app/api/admin/update-teacher/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request) {
  try {
    // 현재 로그인한 사용자 세션 확인
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    // 관리자 권한 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    // 요청 데이터 파싱
    const { teacherId, nation, subject, phone } = await request.json();

    // 필수 필드 확인
    if (!teacherId || !nation || !subject) {
      return NextResponse.json({ error: "모든 필수 정보를 입력해주세요." }, { status: 400 });
    }

    // 강사 정보 업데이트
    const updatedTeacher = await prisma.teachers.update({
      where: {
        id: teacherId,
      },
      data: {
        nation,
        subject,
        phone,
      },
    });

    return NextResponse.json(updatedTeacher);
  } catch (error) {
    console.error("강사 정보 업데이트 중 오류 발생:", error);
    return NextResponse.json({ error: "강사 정보를 업데이트하는 중 오류가 발생했습니다." }, { status: 500 });
  }
}
