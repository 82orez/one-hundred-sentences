// src/app/api/recordings/count/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "사용자 ID가 필요합니다" }, { status: 400 });
  }

  try {
    // 사용자의 모든 녹음 기록 및 횟수 조회
    const recordings = await prisma.recordings.findMany({
      where: {
        userId: userId,
      },
      select: {
        sentenceNo: true,
        attemptCount: true,
      },
    });

    return NextResponse.json(recordings);
  } catch (error) {
    console.error("녹음 횟수 조회 중 오류 발생:", error);
    return NextResponse.json({ error: "녹음 횟수 조회에 실패했습니다" }, { status: 500 });
  }
}