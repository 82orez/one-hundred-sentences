import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
    }

    // 사용자 권한 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || (user.role !== "admin" && user.role !== "semiAdmin")) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const { waitForPurchaseId, courseId } = await req.json();

    if (!waitForPurchaseId || !courseId) {
      return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 });
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
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!waitForPurchase) {
      return NextResponse.json({ error: "결제 대기 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    if (waitForPurchase.status !== "pending") {
      return NextResponse.json({ error: "결제 대기 상태가 아닙니다." }, { status: 400 });
    }

    // 이미 수강 신청이 되어 있는지 확인
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId: courseId,
          studentId: waitForPurchase.userId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({ error: "이미 수강 신청이 완료된 강좌입니다." }, { status: 400 });
    }

    // 트랜잭션으로 결제 확인 및 수강 신청 처리
    await prisma.$transaction(async (tx) => {
      // 1. 결제 대기 상태를 paid로 변경
      await tx.waitForPurchase.update({
        where: { id: waitForPurchaseId },
        data: { status: "paid" },
      });

      // 2. Enrollment 테이블에 등록 정보 저장
      await tx.enrollment.create({
        data: {
          courseId: courseId,
          courseTitle: waitForPurchase.courseTitle,
          studentId: waitForPurchase.userId,
          studentName: waitForPurchase.user.realName || waitForPurchase.userName,
          studentPhone: waitForPurchase.user.phone || waitForPurchase.userPhone,
          status: "active", // 결제 확인 후 바로 활성 상태로 설정
          // description: `관리자에 의해 결제 확인됨 (${new Date().toISOString()})`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "결제가 확인되었고 수강 신청이 완료되었습니다.",
    });
  } catch (error) {
    console.error("결제 확인 처리 중 오류:", error);
    return NextResponse.json(
      {
        error: "결제 확인 처리 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}
