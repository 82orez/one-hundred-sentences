import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

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
