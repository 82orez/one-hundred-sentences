// src/app/api/payment/free-enrollment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { courseId, courseTitle } = await req.json();

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { realName: true, phone: true },
    });

    // 실제 이름과 전화번호 확인
    if (!user?.realName || !user?.phone) {
      return NextResponse.json(
        { error: "사용자 정보 미등록", message: "수강 신청 내역 확인을 위해 반드시 먼저 회원 정보에서 실제 이름과 전화번호를 입력해 주세요." },
        { status: 400 },
      );
    }

    // 기존 수강 신청 여부 확인
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        courseId,
        studentId: session.user.id,
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({ error: "이미 수강 신청된 강좌입니다." }, { status: 409 });
    }

    // 수강 신청 등록
    const enrollment = await prisma.enrollment.create({
      data: {
        courseId,
        courseTitle,
        studentId: session.user.id,
        studentName: user.realName,
        studentPhone: user.phone,
        status: "active",
      },
    });

    return NextResponse.json({ data: enrollment, message: "수강 신청이 완료되었습니다." });
  } catch (error) {
    console.error("Error during enrollment:", error);
    return NextResponse.json({ error: "수강 신청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
