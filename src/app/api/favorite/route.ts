// /app/api/favorite/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Prisma 연결 가져오기

export async function POST(request: Request) {
  try {
    const { sentenceNo, favorite, userId } = await request.json();

    if (!sentenceNo || favorite === undefined || !userId) {
      return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 });
    }

    // Prisma 를 사용하여 CompletedSentence 테이블 업데이트
    try {
      const updatedSentence = await prisma.completedSentence.updateMany({
        where: {
          userId,
          sentenceNo,
        },
        data: {
          favorite,
        },
      });

      return NextResponse.json({ success: true });
    } catch (prismaError) {
      console.error("Prisma 업데이트 오류:", prismaError);
      return NextResponse.json({ error: "즐겨찾기 업데이트 실패" }, { status: 500 });
    }
  } catch (error) {
    console.error("API 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
