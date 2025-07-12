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

    const body = await request.json();
    const { courseId, courseTitle, startDate, classCount, totalFee } = body;

    // 필수 데이터 검증
    if (!courseId || !courseTitle || !startDate || !classCount || !totalFee) {
      return NextResponse.json({ error: "필수 데이터가 누락되었습니다." }, { status: 400 });
    }

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        realName: true,
        phone: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "사용자 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    // 사용자 이름과 전화번호 확인
    if (!user.realName || !user.phone) {
      return NextResponse.json(
        {
          error: "사용자 이름과 전화번호가 필요합니다. 프로필을 완성해주세요.",
        },
        { status: 400 },
      );
    }

    // 이미 해당 강좌에 대해 결제 대기 중인지 확인
    const existingWaitForPurchase = await prisma.waitForPurchase.findFirst({
      where: {
        userId: session.user.id,
        courseId: courseId,
        status: "pending",
      },
    });

    if (existingWaitForPurchase) {
      return NextResponse.json(
        {
          error: "이미 해당 강좌에 대해 결제 대기 중입니다.",
        },
        { status: 409 },
      );
    }

    // 결제 대기 만료일 설정 (7일 후)
    // const expiresAt = new Date();
    // expiresAt.setDate(expiresAt.getDate() + 7);

    // 결제 대기 만료일 설정 (한국 시간 기준으로 다음 날 오후 5시)
    const expiresAt = new Date();
    // 한국 시간대 기준으로 다음 날 설정
    expiresAt.setDate(expiresAt.getDate() + 1);
    // 오후 5시 (17:00)로 설정
    expiresAt.setHours(17, 0, 0, 0);

    // WaitForPurchase 데이터 생성
    const waitForPurchase = await prisma.waitForPurchase.create({
      data: {
        userId: session.user.id,
        courseId: courseId,
        courseTitle: courseTitle,
        userName: user.realName,
        userPhone: user.phone,
        startDate: new Date(startDate),
        classCount: classCount,
        totalFee: totalFee,
        status: "pending",
        expiresAt: expiresAt,
      },
      include: {
        user: {
          select: {
            realName: true,
            phone: true,
            email: true,
          },
        },
        course: {
          select: {
            title: true,
            location: true,
            price: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "수강 신청이 완료되었습니다. 결제 대기 상태로 전환됩니다.",
      data: waitForPurchase,
    });
  } catch (error) {
    console.error("결제 대기 처리 중 오류:", error);
    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}

// 결제 대기 목록 조회
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    // 먼저 만료된 항목들을 업데이트
    const now = new Date();
    await prisma.waitForPurchase.updateMany({
      where: {
        status: "pending",
        expiresAt: {
          lt: now,
        },
      },
      data: {
        status: "expired",
      },
    });

    // role에 따라 다른 조건으로 조회
    let whereCondition: any = {
      status: status as any,
    };

    // student 권한인 경우 자신의 것만 조회
    if (user.role === "student") {
      whereCondition.userId = session.user.id;
    }
    // admin 또는 semiAdmin인 경우 모든 결제 대기 목록 조회 (whereCondition 그대로 사용)

    const waitForPurchases = await prisma.waitForPurchase.findMany({
      where: whereCondition,
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
            location: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: waitForPurchases,
      userRole: user.role,
    });
  } catch (error) {
    console.error("결제 대기 목록 조회 중 오류:", error);
    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}

// 결제 대기 정보 삭제 (취소)
export async function DELETE(request: NextRequest) {
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

    const body = await request.json();
    const { waitForPurchaseId } = body;

    if (!waitForPurchaseId) {
      return NextResponse.json({ error: "삭제할 결제 대기 ID가 필요합니다." }, { status: 400 });
    }

    // 결제 대기 정보 조회
    const waitForPurchase = await prisma.waitForPurchase.findUnique({
      where: { id: waitForPurchaseId },
      select: {
        id: true,
        userId: true,
        courseTitle: true,
        status: true,
      },
    });

    if (!waitForPurchase) {
      return NextResponse.json({ error: "결제 대기 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    // student 권한인 경우 자신의 것만 삭제 가능
    if (user.role === "student" && waitForPurchase.userId !== session.user.id) {
      return NextResponse.json({ error: "자신의 결제 대기 정보만 삭제할 수 있습니다." }, { status: 403 });
    }

    // 이미 결제 완료된 경우 삭제 불가
    if (waitForPurchase.status === "paid") {
      return NextResponse.json({ error: "이미 결제 완료된 강좌는 취소할 수 없습니다." }, { status: 400 });
    }

    // 결제 대기 정보 삭제
    await prisma.waitForPurchase.delete({
      where: { id: waitForPurchaseId },
    });

    return NextResponse.json({
      success: true,
      message: `${waitForPurchase.courseTitle} 강좌의 수강 신청이 취소되었습니다.`,
    });
  } catch (error) {
    console.error("결제 대기 정보 삭제 중 오류:", error);
    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}
