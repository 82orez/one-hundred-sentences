import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

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
