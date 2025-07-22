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
        <span class="value highlight">${user.realName}</span>
      </h3>
      <h3 class="info-item">
        <span class="label">전화번호 :</span>
        <span class="value">${user.phone}</span>
      </h3>
      <h3 class="info-item">
        <span class="label">이메일 :</span>
        <span class="value">${user.email || "미제공"}</span>
      </h3>
    </div>
    
    <div>----------------------------------------------------------</div>
    
    <div class="section">
      <h2>📚 수강 신청 강좌 정보</h2>
      <h3 class="info-item">
        <span class="label">강좌명 :</span>
        <span class="value highlight">${courseTitle}</span>
      </h3>
      <h3 class="info-item">
        <span class="label">수업 시작일 :</span>
        <span class="value">${new Date(startDate).toLocaleDateString("ko-KR")}</span>
      </h3>
      <h3 class="info-item">
        <span class="label">총 수업 횟수 :</span>
        <span class="value">${classCount}회</span>
      </h3>
      <h3 class="info-item">
        <span class="label">입금 예정 수강료 :</span>
        <span class="value" style="color: #28a745; font-weight: bold;">${totalFee.toLocaleString()}원</span>
      </h3>
    </div>
    
    <div>----------------------------------------------------------</div>
    
    <div class="pending-count">
      <h2>📊 현재 결제 대기 강좌 현황</h2>
      <h3>현재 결제 대기 중인 전체 강좌 수 : <span class="count">${pendingCoursesCount}</span>개</h3>
    </div>
  </body>
  </html>
`;

        const { data, error } = await resend.emails.send({
          from: "프렌딩 아카데미 <no-reply@friending.ac>",
          to: ["82orez@naver.com", "82orez@gmail.com"],
          // to: "82orez@naver.com",
          subject: "새로운 수강 신청(결제 대기) 알림",
          html: emailContent,
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
