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
    const { teacherId, nation, subject, phone, nickName } = await request.json();

    // 필수 필드 확인
    if (!teacherId || !nation || !subject) {
      return NextResponse.json({ error: "모든 필수 정보를 입력해주세요." }, { status: 400 });
    }

    // 먼저 강사 정보 가져오기 (userId를 얻기 위해)
    const teacher = await prisma.teachers.findUnique({
      where: {
        id: teacherId,
      },
      select: {
        userId: true,
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: "해당 강사를 찾을 수 없습니다." }, { status: 404 });
    }

    // 트랜잭션으로 두 모델 동시에 업데이트
    const updatedTeacher = await prisma.$transaction(async (tx) => {
      // 1. Teachers 모델 업데이트
      const teacherUpdate = await tx.teachers.update({
        where: {
          id: teacherId,
        },
        data: {
          nation,
          subject,
          phone,
          nickName, // 별칭 필드 추가
        },
      });

      // 2. User 모델의 phone 필드도 함께 업데이트
      await tx.user.update({
        where: {
          id: teacher.userId,
        },
        data: {
          phone,
        },
      });

      return teacherUpdate;
    });

    return NextResponse.json(updatedTeacher);
  } catch (error) {
    console.error("강사 정보 업데이트 중 오류 발생:", error);
    return NextResponse.json({ error: "강사 정보를 업데이트하는 중 오류가 발생했습니다." }, { status: 500 });
  }
}
