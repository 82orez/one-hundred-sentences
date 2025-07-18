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

    // 만료된 기존 신청 내역이 있는지 확인하고 삭제
    const expiredWaitForPurchase = await prisma.waitForPurchase.findFirst({
      where: {
        userId: session.user.id,
        courseId: courseId,
        status: "expired",
      },
    });

    if (expiredWaitForPurchase) {
      // 만료된 신청 내역 삭제
      await prisma.waitForPurchase.delete({
        where: {
          id: expiredWaitForPurchase.id,
        },
      });
    }

    // 결제 대기 만료일 설정 (한국 시간 기준으로 다음 날 오후 5시)
    const koreaTimezone = "Asia/Seoul";

    // 현재 한국 시간 기준으로 오늘 날짜 생성
    const nowInKorea = new Date();
    const koreaToday = new Date(nowInKorea.toLocaleString("en-US", { timeZone: koreaTimezone }));

    // 한국 시간 기준 내일 오후 5시로 설정
    const tomorrowInKorea = addDays(koreaToday, 1);
    const koreaDeadline = setMilliseconds(
      setSeconds(
        setMinutes(
          setHours(tomorrowInKorea, 17), // 오후 5시
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
        // 현재 결제 대기 중인 강좌 개수 조회
        const pendingCoursesCount = await prisma.waitForPurchase.count({
          where: {
            status: "pending",
          },
        });

        // 이메일 내용 구성
        const emailContent = `
  <!DOCTYPE html>
  <html lang="ko">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>새로운 수강 신청 알림</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        background-color: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
      }
      .section {
        background-color: #ffffff;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
      }
      .section h3 {
        color: #495057;
        margin-top: 0;
        margin-bottom: 15px;
        font-size: 18px;
      }
      .info-item {
        margin-bottom: 8px;
        padding: 8px 0;
        border-bottom: 1px solid #f1f3f4;
      }
      .info-item:last-child {
        border-bottom: none;
      }
      .label {
        font-weight: bold;
        color: #6c757d;
        display: inline-block;
        width: 120px;
      }
      .value {
        color: #212529;
      }
      .footer {
        background-color: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        text-align: center;
        color: #6c757d;
        font-size: 14px;
      }
      .highlight {
        background-color: #fff3cd;
        padding: 2px 6px;
        border-radius: 4px;
      }
      .pending-count {
        background-color: #e7f3ff;
        border: 1px solid #b3d9ff;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 20px;
        text-align: center;
      }
      .pending-count h2 {
        color: #0066cc;
        margin: 0;
        font-size: 18px;
      }
      .pending-count .count {
        color: #ff6b35;
        font-weight: bold;
        font-size: 24px;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1 style="color: #007bff; margin: 0;">🎓 새로운 수강 신청 알림</h1>
    </div>

    <div>----------------------------------------------------------</div>
    
    <div class="section">
      <h2>👤 신청자 정보</h2>
      <h3 class="info-item">
        <span class="label">이름 :</span>
        <span class="value">${waitForPurchase.userName}</span>
      </h3>
      <h3 class="info-item">
        <span class="label">전화번호 :</span>
        <span class="value">${waitForPurchase.userPhone}</span>
      </h3>
      <h3 class="info-item">
        <span class="label">이메일 :</span>
        <span class="value">${waitForPurchase.user.email}</span>
      </h3>
    </div>

    <div class="section">
      <h2>🎯 수강 신청 정보</h2>
      <h3 class="info-item">
        <span class="label">강좌명 :</span>
        <span class="value">${waitForPurchase.courseTitle}</span>
      </h3>
      <h3 class="info-item">
        <span class="label">수강 시작일 :</span>
        <span class="value">${waitForPurchase.startDate.toLocaleDateString("ko-KR")}</span>
      </h3>
      <h3 class="info-item">
        <span class="label">수업 횟수 :</span>
        <span class="value">${waitForPurchase.classCount}회</span>
      </h3>
      <h3 class="info-item">
        <span class="label">수강료 :</span>
        <span class="value">${waitForPurchase.totalFee.toLocaleString()}원</span>
      </h3>
    </div>

    <div class="section">
      <h2>📅 결제 정보</h2>
      <h3 class="info-item">
        <span class="label">결제 마감일 :</span>
        <span class="value highlight">${expiresAt.toLocaleDateString("ko-KR")} 오후 5시</span>
      </h3>
      <h3 class="info-item">
        <span class="label">계좌 번호 :</span>
        <span class="value">국민은행 / 680401-00-111448</span>
      </h3>
      <h3 class="info-item">
        <span class="label">예금주 :</span>
        <span class="value">(주)프렌딩</span>
      </h3>
    </div>

    <div class="pending-count">
      <h2>📊 현재 결제 대기 중인 강좌 수</h2>
      <div class="count">${pendingCoursesCount}개</div>
    </div>

    <div class="footer">
      <p>이 메일은 새로운 수강 신청 알림을 위한 자동 발송 메일입니다.</p>
      <p>문의사항이 있으시면 언제든지 연락해 주세요.</p>
    </div>
  </body>
  </html>
        `;

        // 이메일 발송
        await resend.emails.send({
          from: "수강 신청 알림 <no-reply@frending.co.kr>",
          to: ["admin@frending.co.kr"],
          subject: `🎓 새로운 수강 신청 알림 - ${waitForPurchase.courseTitle}`,
          html: emailContent,
        });

        console.log("관리자 이메일 발송 완료");
      }
    } catch (emailError) {
      console.error("이메일 발송 중 오류:", emailError);
      // 이메일 발송 실패는 전체 프로세스를 중단하지 않음
    }

    return NextResponse.json(
      {
        message: "수강 신청이 완료되었습니다. 결제 대기 상태로 전환됩니다.",
        waitForPurchase,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("수강 신청 처리 중 오류:", error);
    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}

// GET 메서드 - 결제 대기 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status") || "pending";

    // 사용자 정보 조회 (역할 확인을 위해)
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

    const isAdmin = user.role === "admin" || user.role === "semiAdmin";

    // 조회 조건 설정
    const whereCondition: any = {
      status: statusParam,
    };

    // 관리자가 아닌 경우, 본인의 데이터만 조회
    if (!isAdmin) {
      whereCondition.userId = session.user.id;
    }

    // 결제 대기 목록 조회
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

// DELETE 메서드 - 결제 대기 취소
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const body = await request.json();
    const { waitForPurchaseId } = body;

    if (!waitForPurchaseId) {
      return NextResponse.json({ error: "결제 대기 ID가 필요합니다." }, { status: 400 });
    }

    // 결제 대기 정보 조회
    const waitForPurchase = await prisma.waitForPurchase.findUnique({
      where: { id: waitForPurchaseId },
      include: {
        user: {
          select: {
            id: true,
            role: true,
          },
        },
      },
    });

    if (!waitForPurchase) {
      return NextResponse.json({ error: "결제 대기 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    // 권한 확인 (본인이거나 관리자)
    const isAdmin = waitForPurchase.user.role === "admin" || waitForPurchase.user.role === "semiAdmin";
    const isOwner = waitForPurchase.userId === session.user.id;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    // 이미 결제 완료된 항목은 취소할 수 없음
    if (waitForPurchase.status === "paid") {
      return NextResponse.json({ error: "이미 결제 완료된 항목은 취소할 수 없습니다." }, { status: 400 });
    }

    // 결제 대기 상태를 cancelled로 변경하는 대신 삭제
    await prisma.waitForPurchase.delete({
      where: { id: waitForPurchaseId },
    });

    return NextResponse.json({
      success: true,
      message: "수강 신청이 취소되었습니다.",
    });
  } catch (error) {
    console.error("결제 대기 취소 중 오류:", error);
    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}

// PATCH 메서드 - 만료된 결제 대기 정보 삭제
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action !== "deleteExpired") {
      return NextResponse.json({ error: "지원하지 않는 액션입니다." }, { status: 400 });
    }

    // 사용자 권한 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        role: true,
      },
    });

    if (!user || (user.role !== "admin" && user.role !== "semiAdmin")) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    // 만료된 결제 대기 정보 삭제
    const deletedCount = await prisma.waitForPurchase.deleteMany({
      where: {
        status: "expired",
      },
    });

    return NextResponse.json({
      success: true,
      message: `만료된 결제 대기 정보 ${deletedCount.count}개가 삭제되었습니다.`,
    });
  } catch (error) {
    console.error("만료된 결제 대기 정보 삭제 중 오류:", error);
    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}
