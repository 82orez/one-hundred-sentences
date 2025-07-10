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
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const waitForPurchases = await prisma.waitForPurchase.findMany({
      where: {
        userId: session.user.id,
        status: status as any,
      },
      include: {
        course: {
          select: {
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
