// src/app/api/favorites/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "인증되지 않은 사용자입니다" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });
    }

    const { sentenceNo } = await req.json();
    
    if (!sentenceNo) {
      return NextResponse.json({ error: "문장 번호가 필요합니다" }, { status: 400 });
    }

    // 이미 즐겨찾기한 문장인지 확인
    const existingFavorite = await prisma.favoriteSentence.findFirst({
      where: {
        userId: user.id,
        sentenceNo: parseInt(sentenceNo, 10),
      },
    });

    if (existingFavorite) {
      // 이미 즐겨찾기되어 있다면 삭제 (토글)
      await prisma.favoriteSentence.delete({
        where: { id: existingFavorite.id },
      });
      return NextResponse.json({ 
        message: "즐겨찾기가 삭제되었습니다", 
        isFavorite: false 
      });
    } else {
      // 즐겨찾기 안 되어 있다면 추가
      await prisma.favoriteSentence.create({
        data: {
          userId: user.id,
          sentenceNo: parseInt(sentenceNo, 10),
        },
      });
      return NextResponse.json({ 
        message: "즐겨찾기에 추가되었습니다", 
        isFavorite: true 
      });
    }
  } catch (error) {
    console.error("즐겨찾기 처리 중 오류:", error);
    return NextResponse.json({ error: "즐겨찾기 처리에 실패했습니다" }, { status: 500 });
  }
}

// 특정 문장이 즐겨찾기되어 있는지 확인하는 API
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const sentenceNo = Number(url.searchParams.get("sentenceNo"));
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "인증되지 않은 사용자입니다" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });
    }

    if (!sentenceNo) {
      return NextResponse.json({ error: "문장 번호가 필요합니다" }, { status: 400 });
    }

    // 즐겨찾기 되어 있는지 확인
    const favorite = await prisma.favoriteSentence.findFirst({
      where: {
        userId: user.id,
        sentenceNo: sentenceNo,
      },
    });

    return NextResponse.json({ 
      isFavorite: !!favorite 
    });
  } catch (error) {
    console.error("즐겨찾기 확인 중 오류:", error);
    return NextResponse.json({ error: "즐겨찾기 확인에 실패했습니다" }, { status: 500 });
  }
}