import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    // 사용자 정보 조회 (role 포함)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "사용자 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    // admin 또는 semiAdmin 권한 확인
    if (user.role !== "admin" && user.role !== "semiAdmin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const body = await request.json();
    const { waitForPurchaseId, courseId } = body;

    if (!waitForPurchaseId || !courseId) {
      return NextResponse.json({ error: "필수 데이터가 누락되었습니다." }, { status: 400 });
    }

    // 결제 대기 정보 조회
    const waitForPurchase = await prisma.waitForPurchase.findUnique({
      where: { id: waitForPurchaseId },
      include: {
        user: {
          select: {
            id: true,
            realName: true,
            phone: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            contents: true,
            teacherId: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    if (!waitForPurchase) {
      return NextResponse.json({ error: "결제 대기 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    // 이미 결제 완료된 경우
    if (waitForPurchase.status === "paid") {
      return NextResponse.json({ error: "이미 결제 완료된 강좌입니다." }, { status: 400 });
    }

    // 결제 대기 상태가 아닌 경우
    if (waitForPurchase.status !== "pending") {
      return NextResponse.json({ error: "결제 대기 상태가 아닙니다." }, { status: 400 });
    }

    // 이미 해당 강좌에 등록된 사용자인지 확인
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: waitForPurchase.userId, // userId 대신 studentId 사용
        courseId: courseId,
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({ error: "이미 해당 강좌에 등록된 사용자입니다." }, { status: 400 });
    }

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (prisma) => {
      // 1. WaitForPurchase 상태를 'paid' 로 업데이트
      const updatedWaitForPurchase = await prisma.waitForPurchase.update({
        where: { id: waitForPurchaseId },
        data: {
          status: "paid",
        },
      });

      // 2. Enrollment 생성
      const enrollment = await prisma.enrollment.create({
        data: {
          studentId: waitForPurchase.userId, // userId 대신 studentId 사용
          courseId: courseId,
          courseTitle: waitForPurchase.courseTitle,
          studentName: waitForPurchase.userName,
          studentPhone: waitForPurchase.userPhone,
          status: "active", // 기본값이 pending 이므로 active로 설정
        },
      });

      return { updatedWaitForPurchase, enrollment };
    });

    return NextResponse.json({
      success: true,
      message: `${waitForPurchase.courseTitle} 강좌의 결제가 확인되었습니다. 수강생이 등록되었습니다.`,
      data: result,
    });
  } catch (error) {
    console.error("결제 확인 처리 중 오류:", error);
    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}
