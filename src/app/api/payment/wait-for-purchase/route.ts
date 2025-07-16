import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addDays, setHours, setMinutes, setSeconds, setMilliseconds } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
        email: true,
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

    // 결제 대기 만료일 설정 (한국 시간 기준으로 다음 날 오후 5시)
    const koreaTimezone = "Asia/Seoul";
    const tomorrow = addDays(new Date(), 1);
    const koreaDeadline = setMilliseconds(
      setSeconds(
        setMinutes(
          setHours(tomorrow, 17), // 오후 5시
          0,
        ),
        0,
      ),
      0,
    );
    // 한국 시간을 UTC로 변환하여 저장
    const expiresAt = fromZonedTime(koreaDeadline, koreaTimezone);

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

    // 관리자 이메일 전송 (직접 호출)
    try {
      if (process.env.RESEND_API_KEY) {
        // 이메일 내용 구성
        const emailContent = `
          새로운 수강 신청자가 추가되었습니다.
          
          [신청자 정보]
          - 이름: ${user.realName}
          - 전화번호: ${user.phone}
          - 이메일: ${user.email || "미제공"}
          
          [강좌 정보]
          - 강좌명: ${courseTitle}
          - 수강 시작일: ${new Date(startDate).toLocaleDateString("ko-KR")}
          - 수업 횟수: ${classCount}회
          - 수강료: ${totalFee.toLocaleString()}원
          
          신청 시간: ${new Date().toLocaleString("ko-KR")}
        `;

        const { data, error } = await resend.emails.send({
          from: "프렌딩 아카데미 <no-reply@friending.ac>",
          to: "82orez@naver.com",
          subject: "새로운 수강 신청 알림",
          text: emailContent,
        });

        if (error) {
          console.error("관리자 이메일 전송 실패:", error);
        } else {
          console.log("관리자 이메일 전송 성공:", data);
        }
      }
    } catch (emailError) {
      console.error("이메일 전송 중 오류:", emailError);
      // 이메일 전송 실패가 수강 신청 자체를 실패시키지 않도록 처리
    }

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

// 만료된 결제 대기 정보 일괄 삭제 (관리자 전용)
export async function PATCH(request: NextRequest) {
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
    const { action } = body;

    if (action === "deleteExpired") {
      // 만료된 결제 대기 정보 일괄 삭제
      const deleteResult = await prisma.waitForPurchase.deleteMany({
        where: {
          status: "expired",
        },
      });

      return NextResponse.json({
        success: true,
        message: `만료된 결제 대기 정보 ${deleteResult.count}건이 삭제되었습니다.`,
        deletedCount: deleteResult.count,
      });
    }

    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  } catch (error) {
    console.error("만료된 결제 대기 정보 일괄 삭제 중 오류:", error);
    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}
