// src/app/api/recordings/total/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  const courseId = url.searchParams.get("courseId");

  const session = await getServerSession(authOptions);

  // 인증 확인
  if (!session || !session.user?.id || session.user.id !== userId) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    // 사용자의 모든 녹음 시도 횟수 합산 조회
    const totalAttempts = await prisma.recordings.aggregate({
      _sum: {
        attemptCount: true,
      },
      where: {
        userId: userId,
        courseId: courseId, // courseId 조건 추가
      },
    });

    return NextResponse.json({
      totalAttempts: totalAttempts._sum.attemptCount || 0,
    });
  } catch (error) {
    console.error("녹음 시도 횟수 조회 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "녹음 시도 횟수 조회에 실패했습니다",
        totalAttempts: 0,
      },
      { status: 500 },
    );
  }
}
