import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// POST: 퍼스 투어 문의 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, message } = body;

    // 필수 필드 검증
    if (!name || !phone || !message) {
      return NextResponse.json({ error: "이름, 연락처, 문의 내용은 필수입니다." }, { status: 400 });
    }

    // 데이터베이스에 저장
    const perthQuestion = await prisma.perthQuestion.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        message: message.trim(),
      },
    });

    // 관리자 이메일 전송
    try {
      if (process.env.RESEND_API_KEY) {
        // 이메일 내용 구성
        const emailContent = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>서호주 스피킹 투어 문의 접수 알림</title>
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
      background-color: #10b981;
      color: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .section {
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .section h3 {
      color: #374151;
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 18px;
      border-bottom: 2px solid #10b981;
      padding-bottom: 8px;
    }
    .info-item {
      margin-bottom: 12px;
      padding: 10px;
      background-color: #f9fafb;
      border-radius: 6px;
      border-left: 4px solid #10b981;
    }
    .label {
      font-weight: bold;
      color: #6b7280;
      display: inline-block;
      width: 100px;
    }
    .value {
      color: #111827;
      font-weight: 500;
    }
    .message-content {
      background-color: #f3f4f6;
      padding: 15px;
      border-radius: 8px;
      margin-top: 10px;
      border-left: 4px solid #3b82f6;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .footer {
      background-color: #f9fafb;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      border: 1px solid #e5e7eb;
    }
    .timestamp {
      color: #9ca3af;
      font-size: 14px;
      text-align: center;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🌏 서호주 스피킹 투어 문의 접수</h1>
  </div>

  <div class="section">
    <h3>👤 문의자 정보</h3>
    <div class="info-item">
      <span class="label">이름:</span>
      <span class="value">${name}</span>
    </div>
    <div class="info-item">
      <span class="label">연락처:</span>
      <span class="value">${phone}</span>
    </div>
    <div class="info-item">
      <span class="label">이메일:</span>
      <span class="value">${email || "미제공"}</span>
    </div>
  </div>

  <div class="section">
    <h3>💬 문의 내용</h3>
    <div class="message-content">${message}</div>
  </div>

  <div class="timestamp">
    문의 접수 시간: ${new Date().toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })}
  </div>

  <div class="footer">
    <p>이 메일은 서호주 스피킹 투어 랜딩 페이지를 통해 자동으로 발송되었습니다.</p>
    <p>문의자에게 빠른 시일 내에 연락해 주세요.</p>
  </div>
</body>
</html>`;

        const { data, error } = await resend.emails.send({
          from: "프렌딩 아카데미 <no-reply@friending.ac>",
          to: ["82orez@naver.com", "82orez@gmail.com", "lina.friending@gmail.com"],
          subject: `[서호주 스피킹 투어] 새로운 문의 접수 - ${name}님`,
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
      // 이메일 전송 실패가 문의 접수 자체를 실패시키지 않도록 처리
    }

    return NextResponse.json(
      {
        message: "문의가 성공적으로 접수되었습니다.",
        data: perthQuestion,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("퍼스 투어 문의 저장 오류:", error);
    return NextResponse.json({ error: "문의 접수 중 오류가 발생했습니다." }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// GET: 퍼스 투어 문의 목록 조회 (관리자용)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      prisma.perthQuestion.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.perthQuestion.count(),
    ]);

    return NextResponse.json({
      data: questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("퍼스 투어 문의 조회 오류:", error);
    return NextResponse.json({ error: "문의 목록을 불러오는 중 오류가 발생했습니다." }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== "admin" && userRole !== "semiAdmin") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const { id, consultationContent } = await request.json();

    if (!id || !consultationContent?.trim()) {
      return NextResponse.json({ error: "문의 ID와 상담 내용이 필요합니다." }, { status: 400 });
    }

    const updatedQuestion = await prisma.perthQuestion.update({
      where: { id },
      data: {
        consultationContent: consultationContent.trim(),
        consultedAt: new Date(),
        consultedBy: session.user?.id,
      },
    });

    return NextResponse.json({
      message: "상담 내용이 성공적으로 등록되었습니다.",
      data: updatedQuestion,
    });
  } catch (error) {
    console.error("상담 내용 등록 실패:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// DELETE: 퍼스 투어 문의 삭제
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== "admin" && userRole !== "semiAdmin") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "문의 ID가 필요합니다." }, { status: 400 });
    }

    // 문의가 존재하는지 확인
    const existingQuestion = await prisma.perthQuestion.findUnique({
      where: { id },
    });

    if (!existingQuestion) {
      return NextResponse.json({ error: "해당 문의를 찾을 수 없습니다." }, { status: 404 });
    }

    // 상담완료된 경우에만 삭제 가능
    if (!existingQuestion.consultationContent) {
      return NextResponse.json({ error: "상담완료된 문의만 삭제할 수 있습니다." }, { status: 400 });
    }

    // 문의 삭제
    await prisma.perthQuestion.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "문의가 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    console.error("문의 삭제 실패:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
